document.addEventListener("DOMContentLoaded", () => {
  const HISTORY_KEY = "music-idea-randomizer-history-v1";
  const BPM_ORDER = [
    "free_or_very_slow",
    "slow_60_75",
    "slow_mid_76_90",
    "mid_91_105",
    "mid_up_106_120",
    "up_121_135",
    "fast_136_150",
    "very_fast_160_180"
  ];

  const els = {
    themeGrid: pickEl(["themeGrid", "themeButtonGrid", "themesGrid"]),
    selectedThemesView: pickEl(["selectedThemesView", "selectedThemes", "selectionSummary"]),
    drawBtn: pickEl(["drawBtn", "randomDrawBtn"]),
    resetBtn: pickEl(["resetBtn", "clearSelectionBtn"]),
    copyResultBtn: pickEl(["copyResultBtn", "copyAllBtn"]),
    copyKeywordsBtn: pickEl(["copyKeywordsBtn", "copyWordsBtn"]),

    keywordResults: pickEl(["keywordResults", "keywordCards", "resultKeywords"]),
    genreResults: pickEl(["genreResults", "recommendedGenres", "genreResultCards"]),
    bpmResults: pickEl(["bpmResults", "recommendedBpms", "bpmResultCards"]),
    themeRecommendationsView: pickEl(["themeRecommendationsView", "themeRecommendationCards"]),
    bpmLibraryView: pickEl(["bpmLibraryView", "bpmGuideView"]),
    genreLibraryView: pickEl(["genreLibraryView", "genreGuideView"]),
    historyView: pickEl(["historyView", "recentHistory"]),
    toast: pickEl(["toast"])
  };

  const state = {
    data: null,
    selectedThemeIds: new Set(),
    lastMergedPools: {},
    lastDraw: {},
    lastGenres: [],
    lastBpms: [],
    history: loadHistory()
  };

  init();

  async function init() {
    decorateActionButtons();
    bindEvents();

    try {
      state.data = await loadData();
      renderThemeButtons();
      renderSelectedThemes();
      renderKeywordCards();
      renderRecommendationCards();
      renderThemeRecommendationCards();
      renderReferenceGuides();
      renderHistory();
      showToast("데이터를 불러왔어요.", "success");
    } catch (error) {
      console.error("[app] init error:", error);
      showToast("data.json을 불러오지 못했습니다.", "error");
    }
  }

  function bindEvents() {
    els.drawBtn?.addEventListener("click", handleDraw);
    els.resetBtn?.addEventListener("click", handleReset);
    els.copyResultBtn?.addEventListener("click", handleCopyFullResult);
    els.copyKeywordsBtn?.addEventListener("click", handleCopyKeywordsOnly);

    els.keywordResults?.addEventListener("click", async (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;

      const action = actionButton.getAttribute("data-action");
      const category = actionButton.getAttribute("data-category");
      if (!category) return;

      if (action === "reroll") {
        rerollSingleCategory(category);
      } else if (action === "copy") {
        const value = state.lastDraw?.[category]?.label || "";
        if (!value) {
          showToast("복사할 키워드가 없습니다.", "warning");
          return;
        }
        const ok = await copyText(value);
        showToast(ok ? `“${value}”를 복사했습니다.` : "복사에 실패했습니다.", ok ? "success" : "error");
      }
    });

    els.themeGrid?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-theme-id]");
      if (!button || !state.data) return;

      const themeId = button.getAttribute("data-theme-id");
      if (!themeId) return;

      toggleThemeSelection(themeId);
    });
  }

  function decorateActionButtons() {
    if (els.drawBtn) {
      els.drawBtn.textContent = "🎲 랜덤 추첨";
      els.drawBtn.classList.add("btn-role", "btn-role--draw");
    }
    if (els.resetBtn) {
      els.resetBtn.textContent = "↺ 선택 초기화";
      els.resetBtn.classList.add("btn-role", "btn-role--reset");
    }
    if (els.copyResultBtn) {
      els.copyResultBtn.textContent = "📋 전체 결과 복사";
      els.copyResultBtn.classList.add("btn-role", "btn-role--copy");
    }
    if (els.copyKeywordsBtn) {
      els.copyKeywordsBtn.textContent = "🧩 키워드만 복사";
      els.copyKeywordsBtn.classList.add("btn-role", "btn-role--keywords");
    }
  }

  async function loadData() {
    const response = await fetch("./data.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const raw = await response.json();

    return {
      version: raw.version || "0.3.0",
      appTitle: raw.appTitle || "Music Idea Randomizer",
      settings: {
        maxSelectableThemes: Number(raw?.settings?.maxSelectableThemes || 2),
        topGenresToShow: Number(raw?.settings?.topGenresToShow || 3),
        topBpmsToShow: Number(raw?.settings?.topBpmsToShow || 2)
      },
      categoryOrder: Array.isArray(raw.categoryOrder) && raw.categoryOrder.length
        ? raw.categoryOrder
        : ["감정", "이미지", "행동", "시공간", "영어 키워드"],
      genreLibrary: raw.genreLibrary || {},
      bpmLibrary: raw.bpmLibrary || {},
      themes: Array.isArray(raw.themes) ? raw.themes.map(normalizeTheme) : []
    };
  }

  function normalizeTheme(theme) {
    const keywordPools = {};
    const rawPools = theme.keywordPools || {};

    Object.keys(rawPools).forEach((category) => {
      keywordPools[category] = normalizePoolItems(rawPools[category]);
    });

    return {
      id: String(theme.id || "").trim(),
      label: String(theme.label || "").trim(),
      labelEn: String(theme.labelEn || "").trim(),
      recommendations: {
        genres: Array.isArray(theme?.recommendations?.genres) ? theme.recommendations.genres : [],
        bpms: Array.isArray(theme?.recommendations?.bpms) ? theme.recommendations.bpms : []
      },
      keywordPools
    };
  }

  function normalizePoolItems(arr) {
    if (!Array.isArray(arr)) return [];

    return arr
      .map((item) => {
        if (typeof item === "string") {
          const label = item.trim();
          if (!label) return null;
          return {
            label,
            description: "",
            weight: 1
          };
        }

        if (item && typeof item === "object") {
          const label = String(item.label || item.value || item.name || "").trim();
          if (!label) return null;

          return {
            ...item,
            label,
            description: String(item.description || "").trim(),
            weight: Number(item.weight || 1)
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  function renderThemeButtons() {
    if (!els.themeGrid || !state.data) return;

    const maxSelectable = state.data.settings.maxSelectableThemes;

    els.themeGrid.innerHTML = state.data.themes.map((theme) => {
      const selected = state.selectedThemeIds.has(theme.id);
      const disabled = !selected && state.selectedThemeIds.size >= maxSelectable;
      const tone = getThemeTone(theme.id);
      const emoji = getThemeEmoji(theme.id);

      return `
        <button
          type="button"
          class="theme-tile ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}"
          data-theme-id="${escapeHtml(theme.id)}"
          data-tone="${escapeHtml(tone)}"
          ${disabled ? "aria-disabled='true'" : ""}
        >
          <span class="theme-tile__emoji">${escapeHtml(emoji)}</span>
          <span class="theme-tile__label">${escapeHtml(theme.label || theme.id)}</span>
          <span class="theme-tile__sub">${escapeHtml(theme.labelEn || "")}</span>
        </button>
      `;
    }).join("");
  }

  function toggleThemeSelection(themeId) {
    const maxSelectable = state.data?.settings?.maxSelectableThemes || 2;

    if (state.selectedThemeIds.has(themeId)) {
      state.selectedThemeIds.delete(themeId);
    } else {
      if (state.selectedThemeIds.size >= maxSelectable) {
        showToast(`대주제는 최대 ${maxSelectable}개까지 선택할 수 있습니다.`, "warning");
        return;
      }
      state.selectedThemeIds.add(themeId);
    }

    renderThemeButtons();
    renderSelectedThemes();
    clearDrawOutputIfNoSelection();
  }

  function renderSelectedThemes() {
    if (!els.selectedThemesView || !state.data) return;

    const selectedThemes = getSelectedThemes();

    if (!selectedThemes.length) {
      els.selectedThemesView.innerHTML = `
        <div class="empty-note">
          아직 선택된 대주제가 없습니다. 위에서 1개 또는 2개를 선택해 주세요.
        </div>
      `;
      return;
    }

    els.selectedThemesView.innerHTML = `
      <div class="selected-theme-list">
        ${selectedThemes.map((theme) => `
          <div class="selected-theme-pill" data-tone="${escapeHtml(getThemeTone(theme.id))}">
            <span class="selected-theme-pill__emoji">${escapeHtml(getThemeEmoji(theme.id))}</span>
            <span class="selected-theme-pill__label">${escapeHtml(theme.label)}</span>
            <span class="selected-theme-pill__sub">${escapeHtml(theme.labelEn || "")}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function handleDraw() {
    if (!state.data) return;

    const selectedThemes = getSelectedThemes();
    if (!selectedThemes.length) {
      showToast("먼저 대주제를 1개 이상 선택해 주세요.", "warning");
      return;
    }

    const mergedPools = mergeKeywordPools(selectedThemes, state.data.categoryOrder);
    const draw = {};

    state.data.categoryOrder.forEach((category) => {
      const pool = mergedPools[category] || [];
      if (pool.length) {
        draw[category] = pickWeightedRandom(pool);
      }
    });

    const mergedGenres = mergeRecommendationList(selectedThemes, "genres");
    const mergedBpms = mergeRecommendationList(selectedThemes, "bpms", true);

    state.lastMergedPools = mergedPools;
    state.lastDraw = draw;
    state.lastGenres = mergedGenres.slice(0, state.data.settings.topGenresToShow);
    state.lastBpms = mergedBpms.slice(0, state.data.settings.topBpmsToShow);

    renderKeywordCards();
    renderRecommendationCards();
    renderThemeRecommendationCards();
    renderReferenceGuides();
    pushHistoryEntry(selectedThemes, draw, state.lastGenres, state.lastBpms);
    renderHistory();

    showToast("키워드를 추첨했습니다.", "success");
  }

  function mergeKeywordPools(selectedThemes, categoryOrder) {
    const merged = {};

    categoryOrder.forEach((category) => {
      const allItems = [];

      selectedThemes.forEach((theme) => {
        const items = Array.isArray(theme.keywordPools?.[category]) ? theme.keywordPools[category] : [];
        items.forEach((item) => {
          allItems.push({
            ...item,
            _sourceThemeId: theme.id,
            _sourceThemeLabel: theme.label
          });
        });
      });

      merged[category] = uniquePoolItems(allItems);
    });

    return merged;
  }

  function uniquePoolItems(items) {
    const seen = new Set();
    const result = [];

    items.forEach((item) => {
      const key = String(item.label || "").trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      result.push(item);
    });

    return result;
  }

  function pickWeightedRandom(items) {
    if (!items.length) return null;

    const totalWeight = items.reduce((sum, item) => {
      const weight = Number(item.weight || 1);
      return sum + (weight > 0 ? weight : 1);
    }, 0);

    let random = Math.random() * totalWeight;

    for (const item of items) {
      const weight = Number(item.weight || 1) > 0 ? Number(item.weight || 1) : 1;
      random -= weight;
      if (random <= 0) return item;
    }

    return items[items.length - 1];
  }

  function mergeRecommendationList(selectedThemes, key, sortBpm = false) {
    const map = new Map();

    selectedThemes.forEach((theme) => {
      const list = Array.isArray(theme?.recommendations?.[key]) ? theme.recommendations[key] : [];

      list.forEach((item) => {
        const refId = key === "genres" ? item.genreId : item.bpmId;
        if (!refId) return;

        if (!map.has(refId)) {
          map.set(refId, {
            id: refId,
            totalWeight: 0,
            reasons: [],
            sourceThemes: new Set()
          });
        }

        const bucket = map.get(refId);
        bucket.totalWeight += Number(item.weight || 1);
        if (item.reason) bucket.reasons.push(item.reason);
        bucket.sourceThemes.add(theme.label);
      });
    });

    let merged = Array.from(map.entries()).map(([id, value]) => ({
      id,
      totalWeight: value.totalWeight,
      reasons: uniqueStrings(value.reasons),
      sourceThemes: Array.from(value.sourceThemes)
    }));

    if (sortBpm) {
      merged.sort((a, b) => {
        const ai = BPM_ORDER.indexOf(a.id);
        const bi = BPM_ORDER.indexOf(b.id);

        if (ai !== -1 && bi !== -1 && ai !== bi) return ai - bi;
        if (b.totalWeight !== a.totalWeight) return b.totalWeight - a.totalWeight;
        return a.id.localeCompare(b.id);
      });

      merged.sort((a, b) => b.totalWeight - a.totalWeight || compareBpmId(a.id, b.id));
      return merged;
    }

    merged.sort((a, b) => b.totalWeight - a.totalWeight || a.id.localeCompare(b.id));
    return merged;
  }

  function compareBpmId(a, b) {
    const ai = BPM_ORDER.indexOf(a);
    const bi = BPM_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  }

  function renderKeywordCards() {
    if (!els.keywordResults || !state.data) return;

    const categories = state.data.categoryOrder || [];
    const hasDraw = categories.some((category) => state.lastDraw?.[category]);

    if (!hasDraw) {
      els.keywordResults.innerHTML = `
        <div class="empty-note">
          아직 추첨 결과가 없습니다. “랜덤 추첨” 버튼을 눌러 주세요.
        </div>
      `;
      return;
    }

    els.keywordResults.innerHTML = categories.map((category) => {
      const item = state.lastDraw?.[category];
      if (!item) {
        return `
          <article class="keyword-card keyword-card--empty">
            <header class="keyword-card__header">
              <h3>${escapeHtml(category)}</h3>
            </header>
            <div class="empty-note">해당 카테고리 데이터가 없습니다.</div>
          </article>
        `;
      }

      return `
        <article class="keyword-card" data-category="${escapeHtml(category)}">
          <header class="keyword-card__header">
            <h3>${escapeHtml(category)}</h3>
            <div class="keyword-card__actions">
              <button type="button" class="mini-btn mini-btn--reroll" data-action="reroll" data-category="${escapeHtml(category)}">🎲 재추첨</button>
              <button type="button" class="mini-btn mini-btn--copy" data-action="copy" data-category="${escapeHtml(category)}">📋 복사</button>
            </div>
          </header>

          <div class="keyword-card__value">${escapeHtml(item.label)}</div>

          ${item.description ? `
            <p class="keyword-card__desc">${escapeHtml(item.description)}</p>
          ` : ""}

          <div class="keyword-card__meta">
            ${item._sourceThemeLabel ? `<span class="keyword-meta-pill">출처: ${escapeHtml(item._sourceThemeLabel)}</span>` : ""}
          </div>
        </article>
      `;
    }).join("");
  }

  function rerollSingleCategory(category) {
    const pool = state.lastMergedPools?.[category] || [];
    if (!pool.length) {
      showToast("재추첨할 후보가 없습니다.", "warning");
      return;
    }

    state.lastDraw[category] = pickWeightedRandom(pool);
    renderKeywordCards();
    showToast(`${category} 카테고리를 다시 추첨했습니다.`, "success");
  }

  function renderRecommendationCards() {
    renderGenreCards();
    renderBpmCards();
  }

  function renderGenreCards() {
    if (!els.genreResults) return;

    if (!state.lastGenres.length) {
      els.genreResults.innerHTML = `<div class="empty-note">추천 장르가 아직 없습니다.</div>`;
      return;
    }

    els.genreResults.innerHTML = state.lastGenres.map((item, index) => {
      const entry = getLibraryEntry(state.data.genreLibrary, item.id);
      return `
        <article class="recommend-card recommend-card--genre">
          <div class="recommend-card__rank">#${index + 1}</div>
          <h3>${escapeHtml(entry?.label || item.id)}</h3>
          ${entry?.typicalBpm ? `<p><strong>대표 BPM:</strong> ${escapeHtml(entry.typicalBpm)}</p>` : ""}
          <p><strong>추천 강도:</strong> ${escapeHtml(String(item.totalWeight))}</p>
          ${item.sourceThemes?.length ? `<p><strong>관련 테마:</strong> ${escapeHtml(item.sourceThemes.join(", "))}</p>` : ""}
          ${item.reasons?.length ? `<p><strong>이유:</strong> ${escapeHtml(item.reasons.join(" / "))}</p>` : ""}
        </article>
      `;
    }).join("");
  }

  function renderBpmCards() {
    if (!els.bpmResults) return;

    if (!state.lastBpms.length) {
      els.bpmResults.innerHTML = `<div class="empty-note">추천 BPM이 아직 없습니다.</div>`;
      return;
    }

    els.bpmResults.innerHTML = state.lastBpms.map((item, index) => {
      const entry = getLibraryEntry(state.data.bpmLibrary, item.id);
      return `
        <article class="recommend-card recommend-card--bpm">
          <div class="recommend-card__rank">#${index + 1}</div>
          <h3>${escapeHtml(entry?.label || item.id)}</h3>
          ${entry?.range ? `<p><strong>구간:</strong> ${escapeHtml(entry.range)}</p>` : ""}
          <p><strong>추천 강도:</strong> ${escapeHtml(String(item.totalWeight))}</p>
          ${entry?.coreMood?.length ? `<p><strong>무드:</strong> ${escapeHtml(entry.coreMood.join(", "))}</p>` : ""}
          ${item.reasons?.length ? `<p><strong>이유:</strong> ${escapeHtml(item.reasons.join(" / "))}</p>` : ""}
        </article>
      `;
    }).join("");
  }

  function renderThemeRecommendationCards() {
    if (!els.themeRecommendationsView || !state.data) return;

    const selectedThemes = getSelectedThemes();

    if (!selectedThemes.length) {
      els.themeRecommendationsView.innerHTML = `<div class="empty-note">대주제를 선택하면 테마별 추천 장르/BPM이 표시됩니다.</div>`;
      return;
    }

    els.themeRecommendationsView.innerHTML = selectedThemes.map((theme) => {
      const topGenres = (theme.recommendations?.genres || []).slice().sort((a, b) => (b.weight || 0) - (a.weight || 0)).slice(0, 3);
      const topBpms = (theme.recommendations?.bpms || []).slice().sort((a, b) => (b.weight || 0) - (a.weight || 0)).slice(0, 2);

      return `
        <article class="theme-rec-card" data-tone="${escapeHtml(getThemeTone(theme.id))}">
          <header class="theme-rec-card__header">
            <div class="theme-rec-card__emoji">${escapeHtml(getThemeEmoji(theme.id))}</div>
            <div>
              <h3>${escapeHtml(theme.label)}</h3>
              <p>${escapeHtml(theme.labelEn || "")}</p>
            </div>
          </header>

          <div class="theme-rec-card__body">
            <div class="theme-rec-card__block">
              <h4>추천 장르</h4>
              ${
                topGenres.length
                  ? topGenres.map((item) => {
                      const label = getLibraryLabel(state.data.genreLibrary, item.genreId);
                      return `<div class="theme-rec-line"><strong>${escapeHtml(label)}</strong> — ${escapeHtml(item.reason || "")}</div>`;
                    }).join("")
                  : `<div class="empty-note">없음</div>`
              }
            </div>

            <div class="theme-rec-card__block">
              <h4>추천 BPM</h4>
              ${
                topBpms.length
                  ? topBpms.map((item) => {
                      const label = getLibraryLabel(state.data.bpmLibrary, item.bpmId);
                      return `<div class="theme-rec-line"><strong>${escapeHtml(label)}</strong> — ${escapeHtml(item.reason || "")}</div>`;
                    }).join("")
                  : `<div class="empty-note">없음</div>`
              }
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderReferenceGuides() {
    renderBpmGuide();
    renderGenreGuide();
  }

  function renderBpmGuide() {
    if (!els.bpmLibraryView || !state.data) return;

    const entries = Object.entries(state.data.bpmLibrary || {}).sort(([a], [b]) => compareBpmId(a, b));

    els.bpmLibraryView.innerHTML = entries.map(([id, raw]) => {
      const entry = typeof raw === "string" ? { label: raw } : raw;

      return `
        <article class="guide-item guide-item--bpm">
          <h4>${escapeHtml(entry.label || id)}</h4>
          ${entry.range ? `<p><strong>범위:</strong> ${escapeHtml(entry.range)}</p>` : ""}
          ${entry.energy ? `<p><strong>에너지:</strong> ${escapeHtml(entry.energy)}</p>` : ""}
          ${entry.coreMood?.length ? `<p><strong>무드:</strong> ${escapeHtml(entry.coreMood.join(", "))}</p>` : ""}
          ${entry.worksBestFor?.length ? `<p><strong>잘 맞는 테마:</strong> ${escapeHtml(entry.worksBestFor.join(", "))}</p>` : ""}
          ${entry.commonGenres?.length ? `<p><strong>자주 맞는 장르:</strong> ${escapeHtml(entry.commonGenres.map((genreId) => getLibraryLabel(state.data.genreLibrary, genreId)).join(", "))}</p>` : ""}
          ${entry.writingTip ? `<p><strong>작곡 팁:</strong> ${escapeHtml(entry.writingTip)}</p>` : ""}
          ${entry.warning ? `<p><strong>주의:</strong> ${escapeHtml(entry.warning)}</p>` : ""}
        </article>
      `;
    }).join("");
  }

  function renderGenreGuide() {
    if (!els.genreLibraryView || !state.data) return;

    const entries = Object.entries(state.data.genreLibrary || {});

    els.genreLibraryView.innerHTML = entries.map(([id, raw]) => {
      const entry = typeof raw === "string" ? { label: raw } : raw;

      return `
        <article class="guide-item guide-item--genre">
          <h4>${escapeHtml(entry.label || id)}</h4>
          ${entry.typicalBpm ? `<p><strong>대표 BPM:</strong> ${escapeHtml(entry.typicalBpm)}</p>` : ""}
          ${entry.coreMood?.length ? `<p><strong>무드:</strong> ${escapeHtml(entry.coreMood.join(", "))}</p>` : ""}
          ${entry.bestThemes?.length ? `<p><strong>잘 맞는 테마:</strong> ${escapeHtml(entry.bestThemes.join(", "))}</p>` : ""}
          ${entry.commonInstruments?.length ? `<p><strong>악기:</strong> ${escapeHtml(entry.commonInstruments.join(", "))}</p>` : ""}
          ${entry.vocalTones?.length ? `<p><strong>보컬 톤:</strong> ${escapeHtml(entry.vocalTones.join(", "))}</p>` : ""}
          ${entry.arrangementTip ? `<p><strong>편곡 팁:</strong> ${escapeHtml(entry.arrangementTip)}</p>` : ""}
          ${entry.relatedBpmIds?.length ? `<p><strong>추천 BPM 구간:</strong> ${escapeHtml(entry.relatedBpmIds.map((bpmId) => getLibraryLabel(state.data.bpmLibrary, bpmId)).join(", "))}</p>` : ""}
        </article>
      `;
    }).join("");
  }

  async function handleCopyKeywordsOnly() {
    const categories = state.data?.categoryOrder || [];
    const words = categories
      .map((category) => state.lastDraw?.[category]?.label || "")
      .filter(Boolean);

    if (!words.length) {
      showToast("복사할 키워드가 없습니다.", "warning");
      return;
    }

    const ok = await copyText(words.join("\n"));
    showToast(ok ? "키워드만 복사했습니다." : "복사에 실패했습니다.", ok ? "success" : "error");
  }

  async function handleCopyFullResult() {
    const text = buildFullResultText();
    if (!text.trim()) {
      showToast("복사할 결과가 없습니다.", "warning");
      return;
    }

    const ok = await copyText(text);
    showToast(ok ? "전체 결과를 복사했습니다." : "복사에 실패했습니다.", ok ? "success" : "error");
  }

  function buildFullResultText() {
    const selectedThemes = getSelectedThemes();
    const lines = [];

    if (selectedThemes.length) {
      lines.push(`[선택 대주제] ${selectedThemes.map((theme) => theme.label).join(" + ")}`);
      lines.push("");
    }

    const categories = state.data?.categoryOrder || [];
    const keywordLines = categories
      .map((category) => {
        const item = state.lastDraw?.[category];
        return item ? `${category}: ${item.label}` : "";
      })
      .filter(Boolean);

    if (keywordLines.length) {
      lines.push("[키워드]");
      lines.push(...keywordLines);
      lines.push("");
    }

    if (state.lastGenres.length) {
      lines.push("[추천 장르]");
      state.lastGenres.forEach((item) => {
        const label = getLibraryLabel(state.data.genreLibrary, item.id);
        lines.push(`- ${label}`);
      });
      lines.push("");
    }

    if (state.lastBpms.length) {
      lines.push("[추천 BPM]");
      state.lastBpms.forEach((item) => {
        const label = getLibraryLabel(state.data.bpmLibrary, item.id);
        lines.push(`- ${label}`);
      });
    }

    return lines.join("\n").trim();
  }

  function handleReset() {
    state.selectedThemeIds.clear();
    state.lastMergedPools = {};
    state.lastDraw = {};
    state.lastGenres = [];
    state.lastBpms = [];

    renderThemeButtons();
    renderSelectedThemes();
    renderKeywordCards();
    renderRecommendationCards();
    renderThemeRecommendationCards();
    showToast("선택과 결과를 초기화했습니다.", "success");
  }

  function clearDrawOutputIfNoSelection() {
    if (state.selectedThemeIds.size > 0) return;

    state.lastMergedPools = {};
    state.lastDraw = {};
    state.lastGenres = [];
    state.lastBpms = [];

    renderKeywordCards();
    renderRecommendationCards();
    renderThemeRecommendationCards();
  }

  function getSelectedThemes() {
    if (!state.data) return [];
    return state.data.themes.filter((theme) => state.selectedThemeIds.has(theme.id));
  }

  function getLibraryEntry(library, id) {
    if (!library || !id) return null;
    const entry = library[id];
    if (!entry) return null;
    if (typeof entry === "string") return { label: entry };
    return entry;
  }

  function getLibraryLabel(library, id) {
    return getLibraryEntry(library, id)?.label || id;
  }

  function pushHistoryEntry(selectedThemes, draw, genres, bpms) {
    const hasAnyKeyword = Object.values(draw).some(Boolean);
    if (!hasAnyKeyword) return;

    const entry = {
      createdAt: new Date().toISOString(),
      selectedThemes: selectedThemes.map((theme) => ({ id: theme.id, label: theme.label })),
      draw: Object.fromEntries(
        Object.entries(draw).map(([category, item]) => [category, item?.label || ""])
      ),
      genres: genres.map((item) => getLibraryLabel(state.data.genreLibrary, item.id)),
      bpms: bpms.map((item) => getLibraryLabel(state.data.bpmLibrary, item.id))
    };

    state.history.unshift(entry);
    state.history = state.history.slice(0, 20);
    saveHistory();
  }

  function renderHistory() {
    if (!els.historyView) return;

    if (!state.history.length) {
      els.historyView.innerHTML = `<div class="empty-note">아직 히스토리가 없습니다.</div>`;
      return;
    }

    els.historyView.innerHTML = state.history.map((entry) => {
      const themeText = entry.selectedThemes.map((theme) => theme.label).join(" + ");
      const words = Object.values(entry.draw).filter(Boolean).join(" / ");

      return `
        <article class="history-card">
          <div class="history-card__top">
            <strong>${escapeHtml(themeText)}</strong>
            <span>${escapeHtml(formatDate(entry.createdAt))}</span>
          </div>
          <div class="history-card__words">${escapeHtml(words)}</div>
          <div class="history-card__meta">
            ${entry.genres?.length ? `<span>장르: ${escapeHtml(entry.genres.join(", "))}</span>` : ""}
            ${entry.bpms?.length ? `<span>BPM: ${escapeHtml(entry.bpms.join(", "))}</span>` : ""}
          </div>
        </article>
      `;
    }).join("");
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("[app] history load failed:", error);
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
    } catch (error) {
      console.warn("[app] history save failed:", error);
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn("[app] clipboard copy failed:", error);
      return false;
    }
  }

  function pickEl(idList) {
    for (const id of idList) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  function uniqueStrings(arr) {
    return Array.from(new Set((arr || []).filter(Boolean)));
  }

  function getThemeTone(themeId) {
    const toneMap = {
      love: "warm",
      breakup: "dark",
      happiness: "bright",
      sadness: "dark",
      hope: "sky",
      despair: "dark",
      peace: "mint",
      anger: "fire",
      anxiety: "violet",
      growth: "sky",
      nostalgia: "earth",
      meeting: "bright",
      parting: "dark",
      beginning: "sky",
      ending: "earth",
      friendship: "bright",
      betrayal: "dark",
      hospitality: "warm",
      alienation: "dark",
      community: "mint",
      spring_life: "bright",
      autumn_death: "earth",
      day_light: "bright",
      night_darkness: "violet",
      journey: "sky",
      settlement: "earth",
      solitude: "dark",
      confidence: "gold",
      freedom: "sky",
      confinement: "dark",
      truth: "mint",
      deception: "violet",
      celebration: "gold",
      mourning: "dark",
      victory: "gold",
      defeat: "earth",
      challenge: "fire",
      giving_up: "earth"
    };

    return toneMap[themeId] || "neutral";
  }

  function getThemeEmoji(themeId) {
    const emojiMap = {
      love: "❤️",
      breakup: "💔",
      happiness: "😊",
      sadness: "🌧️",
      hope: "🌅",
      despair: "🕳️",
      peace: "🍃",
      anger: "🔥",
      anxiety: "🌫️",
      growth: "🌱",
      nostalgia: "📷",
      meeting: "🤝",
      parting: "🚪",
      beginning: "✨",
      ending: "🌙",
      friendship: "🫶",
      betrayal: "🗡️",
      hospitality: "🏠",
      alienation: "🪞",
      community: "👥",
      spring_life: "🌸",
      autumn_death: "🍂",
      day_light: "☀️",
      night_darkness: "🌌",
      journey: "🛣️",
      settlement: "🪵",
      solitude: "🚶",
      confidence: "🦁",
      freedom: "🕊️",
      confinement: "⛓️",
      truth: "💡",
      deception: "🎭",
      celebration: "🎉",
      mourning: "🕯️",
      victory: "🏆",
      defeat: "🥀",
      challenge: "⛰️",
      giving_up: "🫥"
    };

    return emojiMap[themeId] || "🎵";
  }

  function showToast(message, type = "default") {
    if (!els.toast) {
      console.log(`[toast:${type}] ${message}`);
      return;
    }

    els.toast.textContent = message;
    els.toast.className = `toast is-visible ${type ? `toast--${type}` : ""}`;

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      els.toast.className = "toast";
    }, 2200);
  }

  function formatDate(iso) {
    try {
      const date = new Date(iso);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const mi = String(date.getMinutes()).padStart(2, "0");
      return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
    } catch {
      return iso;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
});
