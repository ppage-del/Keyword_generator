const state = {
  data: null,
  selectedThemeIds: new Set(),
  latestResultText: "",
  lastMergedPools: null,
  lastDrawnKeywords: null,
  lastMergedGenres: [],
  lastMergedBpms: []
};

const els = {
  themeGrid: document.getElementById("themeGrid"),
  selectedSummary: document.getElementById("selectedSummary"),
  drawBtn: document.getElementById("drawBtn"),
  resetBtn: document.getElementById("resetBtn"),
  copyBtn: document.getElementById("copyBtn"),
  emptyState: document.getElementById("emptyState"),
  resultWrap: document.getElementById("resultWrap"),
  selectedThemesView: document.getElementById("selectedThemesView"),
  keywordCards: document.getElementById("keywordCards"),
  genreRecommendations: document.getElementById("genreRecommendations"),
  bpmRecommendations: document.getElementById("bpmRecommendations"),
  copyKeywordsBtn: document.getElementById("copyKeywordsBtn"),
  themeRecommendationsView: document.getElementById("themeRecommendationsView"),
  bpmLibraryView: document.getElementById("bpmLibraryView"),
  genreLibraryView: document.getElementById("genreLibraryView")
};

init();
renderReferenceGuides();


async function init() {
  bindEvents();

  try {
    const response = await fetch("./data.json");
    if (!response.ok) {
      throw new Error("data.json을 불러오지 못했습니다.");
    }

    const data = await response.json();
    validateData(data);

    state.data = data;
    renderThemeButtons();
    updateSelectedSummary();
  } catch (error) {
    console.error(error);
    els.themeGrid.innerHTML = `
      <div class="empty-state">
        data.json을 읽는 중 오류가 발생했습니다.<br />
        파일 경로와 JSON 형식을 확인해주세요.
      </div>
    `;
  }
}

function bindEvents() {
  els.drawBtn.addEventListener("click", handleDraw);
  els.resetBtn.addEventListener("click", handleReset);
  els.copyBtn.addEventListener("click", handleCopy);
  els.copyKeywordsBtn.addEventListener("click", handleCopyKeywordsOnly);
  els.keywordCards.addEventListener("click", handleKeywordCardAction);
}

function validateData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("data.json 형식이 올바르지 않습니다.");
  }

  if (!Array.isArray(data.themes)) {
    throw new Error("themes 배열이 필요합니다.");
  }

  if (!Array.isArray(data.categoryOrder)) {
    throw new Error("categoryOrder 배열이 필요합니다.");
  }
}

function getSettings() {
  const defaults = {
    maxSelectableThemes: 2,
    topGenresToShow: 3,
    topBpmsToShow: 2
  };

  return {
    ...defaults,
    ...(state.data?.settings || {})
  };
}

function getCategoryOrder() {
  return state.data?.categoryOrder || ["감정", "이미지", "행동", "시공간", "영어 키워드"];
}

function renderThemeButtons() {
  const themes = state.data.themes;

  els.themeGrid.innerHTML = themes.map(theme => {
    const activeClass = state.selectedThemeIds.has(theme.id) ? "is-active" : "";

    return `
      <button class="theme-btn ${activeClass}" data-theme-id="${escapeHtml(theme.id)}">
        <span class="ko">${escapeHtml(theme.label)}</span>
        <span class="en">${escapeHtml(theme.labelEn || "")}</span>
      </button>
    `;
  }).join("");

  els.themeGrid.querySelectorAll(".theme-btn").forEach(button => {
    button.addEventListener("click", () => {
      const themeId = button.dataset.themeId;
      toggleTheme(themeId);
    });
  });
}

function toggleTheme(themeId) {
  const { maxSelectableThemes } = getSettings();

  if (state.selectedThemeIds.has(themeId)) {
    state.selectedThemeIds.delete(themeId);
  } else {
    if (state.selectedThemeIds.size >= maxSelectableThemes) {
      showToast(`대주제는 최대 ${maxSelectableThemes}개까지 선택할 수 있어요.`);
      return;
    }
    state.selectedThemeIds.add(themeId);
  }

  renderThemeButtons();
  updateSelectedSummary();
  clearResult();
}

function getSelectedThemes() {
  return state.data.themes.filter(theme => state.selectedThemeIds.has(theme.id));
}

function updateSelectedSummary() {
  const selectedThemes = getSelectedThemes();

  if (selectedThemes.length === 0) {
    els.selectedSummary.textContent = "선택된 대주제: 없음";
    return;
  }

  const text = selectedThemes
    .map(theme => `${theme.label} (${theme.labelEn || ""})`)
    .join(" + ");

  els.selectedSummary.textContent = `선택된 대주제: ${text}`;
}

function normalizeKeywordItem(item) {
  if (typeof item === "string") {
    return { label: item };
  }

  if (item && typeof item === "object" && typeof item.label === "string") {
    return item;
  }

  return null;
}

function uniqueBy(array, keyFn) {
  const seen = new Set();
  const result = [];

  for (const item of array) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function mergeKeywordPools(themes) {
  const categories = getCategoryOrder();
  const merged = {};

  categories.forEach(category => {
    const allItems = themes.flatMap(theme => theme.keywordPools?.[category] || []);
    const normalized = allItems
      .map(normalizeKeywordItem)
      .filter(Boolean);

    merged[category] = uniqueBy(normalized, item => item.label);
  });

  return merged;
}

function pickRandom(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

function drawKeywordsFromPools(pools) {
  const result = {};
  const categories = getCategoryOrder();

  categories.forEach(category => {
    const picked = pickRandom(pools[category] || []);
    result[category] = picked ? picked.label : null;
  });

  return result;
}

function mergeRecommendations(themes, type) {
  const mergedMap = new Map();

  themes.forEach(theme => {
    const list = theme.recommendations?.[type] || [];

    list.forEach(item => {
      const key = type === "genres" ? item.genreId : item.bpmId;
      if (!key) return;

      const current = mergedMap.get(key) || {
        id: key,
        weight: 0,
        reasons: []
      };

      current.weight += Number(item.weight || 0);

      if (item.reason) {
        current.reasons.push(item.reason);
      }

      mergedMap.set(key, current);
    });
  });

  return [...mergedMap.values()]
    .map(item => ({
      ...item,
      label: resolveRecommendationLabel(type, item.id),
      reason: [...new Set(item.reasons)].join(" / ")
    }))
    .sort((a, b) => b.weight - a.weight);
}

function resolveRecommendationLabel(type, id) {
  if (type === "genres") {
    return state.data.genreLibrary?.[id]?.label || id;
  }

  if (type === "bpms") {
    return state.data.bpmLibrary?.[id]?.label || id;
  }

  return id;
}

function handleDraw() {
  const selectedThemes = getSelectedThemes();

  if (selectedThemes.length === 0) {
    showToast("먼저 대주제를 1개 이상 선택해주세요.");
    return;
  }

  const mergedPools = mergeKeywordPools(selectedThemes);
  state.lastMergedPools = mergedPools;
  const hasAnyKeyword = Object.values(mergedPools).some(items => items.length > 0);

  if (!hasAnyKeyword) {
    showToast("선택한 대주제에 키워드가 아직 없습니다.");
    return;
  }

  const drawnKeywords = drawKeywordsFromPools(mergedPools);
  const mergedGenres = mergeRecommendations(selectedThemes, "genres");
  const mergedBpms = mergeRecommendations(selectedThemes, "bpms");

  renderResult(selectedThemes, drawnKeywords, mergedGenres, mergedBpms);
}

function renderResult(selectedThemes, drawnKeywords, genres, bpms) {
  els.emptyState.classList.add("is-hidden");
  els.resultWrap.classList.remove("is-hidden");

  els.selectedThemesView.innerHTML = selectedThemes.map(theme => `
    <div class="theme-tag">
      ${escapeHtml(theme.label)}
      <span>(${escapeHtml(theme.labelEn || "")})</span>
    </div>
  `).join("");

  const categories = getCategoryOrder();
  els.keywordCards.innerHTML = categories.map(category => {
    const value = drawnKeywords[category];
    return `
      <div class="keyword-card">
        <div class="keyword-label">${escapeHtml(category)}</div>
        <div class="keyword-value">${escapeHtml(value || "-")}</div>
      </div>
    `;
  }).join("");

  const { topGenresToShow, topBpmsToShow } = getSettings();

  els.genreRecommendations.innerHTML = renderRecommendationList(
    genres.slice(0, topGenresToShow),
    "추천 장르가 아직 없습니다."
  );

  els.bpmRecommendations.innerHTML = renderRecommendationList(
    bpms.slice(0, topBpmsToShow),
    "추천 BPM이 아직 없습니다."
  );

  state.latestResultText = buildResultText(selectedThemes, drawnKeywords, genres, bpms);
}

function renderRecommendationList(items, emptyMessage) {
  if (!items.length) {
    return `<div class="empty-state">${escapeHtml(emptyMessage)}</div>`;
  }

  return items.map(item => `
    <div class="recommend-item">
      <div class="recommend-top">
        <div class="recommend-name">${escapeHtml(item.label)}</div>
        <div class="recommend-score">weight ${item.weight}</div>
      </div>
      <div class="recommend-reason">${escapeHtml(item.reason || "설명 없음")}</div>
    </div>
  `).join("");
}

function buildResultText(selectedThemes, drawnKeywords, genres, bpms) {
  const categories = getCategoryOrder();
  const { topGenresToShow, topBpmsToShow } = getSettings();

  const lines = [];

  lines.push(
    "선택된 대주제: " +
      selectedThemes.map(theme => `${theme.label} (${theme.labelEn || ""})`).join(" + ")
  );
  lines.push("");

  lines.push("[랜덤 키워드]");
  categories.forEach(category => {
    lines.push(`- ${category}: ${drawnKeywords[category] || "-"}`);
  });

  lines.push("");
  lines.push("[추천 장르]");
  if (genres.length > 0) {
    genres.slice(0, topGenresToShow).forEach(item => {
      lines.push(`- ${item.label} (weight ${item.weight})`);
    });
  } else {
    lines.push("- 없음");
  }

  lines.push("");
  lines.push("[추천 BPM]");
  if (bpms.length > 0) {
    bpms.slice(0, topBpmsToShow).forEach(item => {
      lines.push(`- ${item.label} (weight ${item.weight})`);
    });
  } else {
    lines.push("- 없음");
  }

  return lines.join("\n");
}

function handleReset() {
  state.selectedThemeIds.clear();
  renderThemeButtons();
  updateSelectedSummary();
  clearResult();
}

function handleCopy() {
  if (!state.latestResultText) {
    showToast("복사할 결과가 아직 없습니다.");
    return;
  }

  navigator.clipboard.writeText(state.latestResultText)
    .then(() => {
      showToast("결과를 복사했어요.");
    })
    .catch(error => {
      console.error(error);
      showToast("복사에 실패했어요.");
    });
}

function clearResult() {
  els.emptyState.classList.remove("is-hidden");
  els.resultWrap.classList.add("is-hidden");
  state.latestResultText = "";
}

function showToast(message) {
  const oldToast = document.querySelector(".toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 1800);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderReferenceGuides() {
  const bpmLibrary = state.data.bpmLibrary || {};
  const genreLibrary = state.data.genreLibrary || {};

  els.bpmLibraryView.innerHTML = Object.entries(bpmLibrary).map(([id, item]) => {
    return `
      <div class="guide-item">
        <div class="guide-item-title">${escapeHtml(item.label || id)}</div>
        <div class="guide-item-desc">${escapeHtml(item.notes || "")}</div>
      </div>
    `;
  }).join("") || `<div class="empty-state">BPM 라이브러리가 비어 있습니다.</div>`;

  els.genreLibraryView.innerHTML = Object.entries(genreLibrary).map(([id, item]) => {
    const bpmText = Array.isArray(item.typicalBpm)
      ? item.typicalBpm
          .map(bpmId => state.data.bpmLibrary?.[bpmId]?.label || bpmId)
          .join(", ")
      : "";

    return `
      <div class="guide-item">
        <div class="guide-item-title">${escapeHtml(item.label || id)}</div>
        <div class="guide-item-desc">
          ${escapeHtml(item.description || "")}
          ${bpmText ? `<br>추천 BPM: ${escapeHtml(bpmText)}` : ""}
        </div>
      </div>
    `;
  }).join("") || `<div class="empty-state">장르 라이브러리가 비어 있습니다.</div>`;
}

function renderKeywordCards() {
  const categories = getCategoryOrder();
  const drawnKeywords = state.lastDrawnKeywords || {};

  els.keywordCards.innerHTML = categories.map(category => {
    const value = drawnKeywords[category];
    return `
      <div class="keyword-card">
        <div class="keyword-label">${escapeHtml(category)}</div>
        <div class="keyword-value">${escapeHtml(value || "-")}</div>
        <div class="keyword-card-actions">
          <button class="keyword-mini-btn" data-copy-category="${escapeHtml(category)}">복사</button>
          <button class="keyword-mini-btn" data-reroll-category="${escapeHtml(category)}">다시 뽑기</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderResult(selectedThemes, drawnKeywords, genres, bpms) {
  els.emptyState.classList.add("is-hidden");
  els.resultWrap.classList.remove("is-hidden");

  els.selectedThemesView.innerHTML = selectedThemes.map(theme => `
    <div class="theme-tag">
      ${escapeHtml(theme.label)}
      <span>(${escapeHtml(theme.labelEn || "")})</span>
    </div>
  `).join("");

  state.lastDrawnKeywords = { ...drawnKeywords };
  state.lastMergedGenres = [...genres];
  state.lastMergedBpms = [...bpms];

  renderKeywordCards();
  renderThemeRecommendationCards(selectedThemes);

  const { topGenresToShow, topBpmsToShow } = getSettings();

  els.genreRecommendations.innerHTML = renderRecommendationList(
    genres.slice(0, topGenresToShow),
    "추천 장르가 아직 없습니다."
  );

  els.bpmRecommendations.innerHTML = renderRecommendationList(
    bpms.slice(0, topBpmsToShow),
    "추천 BPM이 아직 없습니다."
  );

  state.latestResultText = buildResultText(selectedThemes, state.lastDrawnKeywords, genres, bpms);
}

function handleKeywordCardAction(event) {
  const copyButton = event.target.closest("[data-copy-category]");
  const rerollButton = event.target.closest("[data-reroll-category]");

  if (copyButton) {
    const category = copyButton.dataset.copyCategory;
    const value = state.lastDrawnKeywords?.[category];
    if (!value) {
      showToast("복사할 키워드가 없습니다.");
      return;
    }

    navigator.clipboard.writeText(value)
      .then(() => showToast(`${category} 키워드를 복사했어요.`))
      .catch(() => showToast("복사에 실패했어요."));
    return;
  }

  if (rerollButton) {
    const category = rerollButton.dataset.rerollCategory;
    rerollSingleCategory(category);
  }
}

function rerollSingleCategory(category) {
  const items = state.lastMergedPools?.[category] || [];
  const currentValue = state.lastDrawnKeywords?.[category];

  if (!items.length) {
    showToast("이 카테고리에 다시 뽑을 키워드가 없습니다.");
    return;
  }

  let candidateItems = items;

  if (items.length > 1 && currentValue) {
    candidateItems = items.filter(item => item.label !== currentValue);
    if (!candidateItems.length) {
      candidateItems = items;
    }
  }

  const picked = pickRandom(candidateItems);
  state.lastDrawnKeywords[category] = picked ? picked.label : null;

  renderKeywordCards();
  state.latestResultText = buildResultText(
    getSelectedThemes(),
    state.lastDrawnKeywords,
    state.lastMergedGenres,
    state.lastMergedBpms
  );

  showToast(`${category}만 다시 뽑았어요.`);
}

function handleCopyKeywordsOnly() {
  if (!state.lastDrawnKeywords) {
    showToast("복사할 키워드 결과가 없습니다.");
    return;
  }

  const text = getCategoryOrder()
    .map(category => state.lastDrawnKeywords[category])
    .filter(Boolean)
    .join("\n");

  if (!text) {
    showToast("복사할 키워드가 없습니다.");
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => showToast("키워드만 복사했어요."))
    .catch(() => showToast("복사에 실패했어요."));
}

function renderThemeRecommendationCards(selectedThemes) {
  els.themeRecommendationsView.innerHTML = selectedThemes.map(theme => {
    const genres = (theme.recommendations?.genres || [])
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
      .slice(0, 3)
      .map(item => state.data.genreLibrary?.[item.genreId]?.label || item.genreId);

    const bpms = (theme.recommendations?.bpms || [])
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
      .slice(0, 2)
      .map(item => state.data.bpmLibrary?.[item.bpmId]?.label || item.bpmId);

    return `
      <div class="theme-recommend-card">
        <div class="theme-recommend-title">${escapeHtml(theme.label)} (${escapeHtml(theme.labelEn || "")})</div>
        <div class="theme-recommend-sub">추천 장르: ${escapeHtml(genres.join(", ") || "-")}</div>
        <div class="theme-recommend-sub">추천 BPM: ${escapeHtml(bpms.join(", ") || "-")}</div>
      </div>
    `;
  }).join("");
}
