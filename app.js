const state = {
  data: null,
  selectedThemeIds: new Set(),
  latestResultText: ""
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
  bpmRecommendations: document.getElementById("bpmRecommendations")
};

init();

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
