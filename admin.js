document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "music-idea-admin-draft-v1";
  const CATEGORY_KEYS = window.CATEGORY_KEYS || ["감정", "이미지", "행동", "시공간", "영어 키워드"];
  const THEME_PRESETS = window.THEME_PRESETS || {};
  const THEME_BUTTON_ORDER = window.THEME_BUTTON_ORDER || Object.keys(THEME_PRESETS);
  const GENRE_LIBRARY = window.GENRE_LIBRARY || {};
  const BPM_LIBRARY = window.BPM_LIBRARY || {};

  const CATEGORY_FIELD_MAP = {
    "감정": "emotionInput",
    "이미지": "imageInput",
    "행동": "actionInput",
    "시공간": "timeSpaceInput",
    "영어 키워드": "englishInput"
  };

  const els = {
    themeButtonGrid: document.getElementById("themeButtonGrid"),
    customThemeBtn: document.getElementById("customThemeBtn"),
    restoreDraftBtn: document.getElementById("restoreDraftBtn"),
    clearDraftBtn: document.getElementById("clearDraftBtn"),

    themeId: document.getElementById("themeId"),
    themeLabel: document.getElementById("themeLabel"),
    themeLabelEn: document.getElementById("themeLabelEn"),
    genreRecommendations: document.getElementById("genreRecommendations"),
    bpmRecommendations: document.getElementById("bpmRecommendations"),

    emotionInput: document.getElementById("emotionInput"),
    imageInput: document.getElementById("imageInput"),
    actionInput: document.getElementById("actionInput"),
    timeSpaceInput: document.getElementById("timeSpaceInput"),
    englishInput: document.getElementById("englishInput"),

    clearInputsBtn: document.getElementById("clearInputsBtn"),

    rawInput: document.getElementById("rawInput"),
    parseRawBtn: document.getElementById("parseRawBtn"),

    countsView: document.getElementById("countsView"),
    recommendationView: document.getElementById("recommendationView"),
    summaryBox: document.getElementById("summaryBox"),

    generateThemeBtn: document.getElementById("generateThemeBtn"),
    generatePoolsBtn: document.getElementById("generatePoolsBtn"),
    generateDataBtn: document.getElementById("generateDataBtn"),
    copyOutputBtn: document.getElementById("copyOutputBtn"),
    downloadOutputBtn: document.getElementById("downloadOutputBtn"),
    outputJson: document.getElementById("outputJson"),

    statusText: document.getElementById("statusText")
  };

  const state = {
    activeThemeKey: null,
    loadedData: null,
    lastOutputType: "theme",
    lastDownloadName: "theme.json",
    autoSaveTimer: null,
    isApplyingPreset: false
  };

  init();

  async function init() {
    renderThemeButtons();
    bindEvents();
    renderPreview();
    await loadExistingData();
    restoreDraftSilently();
    renderPreview();
  }

  function bindEvents() {
    els.customThemeBtn?.addEventListener("click", handleCustomThemeMode);
    els.restoreDraftBtn?.addEventListener("click", handleRestoreDraft);
    els.clearDraftBtn?.addEventListener("click", handleClearDraft);
    els.clearInputsBtn?.addEventListener("click", handleClearInputs);
    els.parseRawBtn?.addEventListener("click", handleParseRaw);

    els.generateThemeBtn?.addEventListener("click", handleGenerateThemeJson);
    els.generatePoolsBtn?.addEventListener("click", handleGenerateKeywordPoolsJson);
    els.generateDataBtn?.addEventListener("click", handleGenerateFullDataJson);
    els.copyOutputBtn?.addEventListener("click", handleCopyOutput);
    els.downloadOutputBtn?.addEventListener("click", handleDownloadOutput);

    [
      els.themeId,
      els.themeLabel,
      els.themeLabelEn,
      els.genreRecommendations,
      els.bpmRecommendations,
      els.emotionInput,
      els.imageInput,
      els.actionInput,
      els.timeSpaceInput,
      els.englishInput,
      els.rawInput
    ].forEach((el) => {
      el?.addEventListener("input", () => {
        if (!state.isApplyingPreset) {
          maybeGenerateThemeId();
        }
        renderPreview();
        scheduleDraftSave();
      });
    });

    els.themeId?.addEventListener("input", () => {
      if (state.activeThemeKey && els.themeId.value.trim() !== THEME_PRESETS[state.activeThemeKey]?.id) {
        clearActiveThemeSelection();
      }
    });

    els.themeLabel?.addEventListener("input", () => {
      if (state.activeThemeKey && els.themeLabel.value.trim() !== THEME_PRESETS[state.activeThemeKey]?.label) {
        clearActiveThemeSelection();
      }
    });

    els.themeLabelEn?.addEventListener("input", () => {
      if (state.activeThemeKey && els.themeLabelEn.value.trim() !== THEME_PRESETS[state.activeThemeKey]?.labelEn) {
        clearActiveThemeSelection();
      }
    });
  }

  async function loadExistingData() {
    try {
      const response = await fetch("./data.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data || typeof data !== "object") {
        throw new Error("data.json 형식이 올바르지 않습니다.");
      }

      if (!Array.isArray(data.themes)) {
        data.themes = [];
      }

      state.loadedData = data;
      setStatus("기존 data.json을 불러왔습니다.", "success");
    } catch (error) {
      state.loadedData = buildFallbackData();
      setStatus("data.json을 불러오지 못해 기본 구조로 시작합니다.", "warning");
      console.warn("[admin] data.json load failed:", error);
    }
  }

  function buildFallbackData() {
    return {
      version: "0.3.0",
      appTitle: "Music Idea Randomizer",
      settings: {
        maxSelectableThemes: 2,
        topGenresToShow: 3,
        topBpmsToShow: 2
      },
      categoryOrder: CATEGORY_KEYS.slice(),
      genreLibrary: GENRE_LIBRARY,
      bpmLibrary: BPM_LIBRARY,
      themes: THEME_BUTTON_ORDER.map((key) => {
        const preset = THEME_PRESETS[key];
        return {
          id: preset?.id || key,
          label: preset?.label || key,
          labelEn: preset?.labelEn || key,
          recommendations: cloneRecommendations(preset?.recommendations),
          keywordPools: buildEmptyKeywordPools()
        };
      })
    };
  }

  function buildEmptyKeywordPools() {
    const pools = {};
    CATEGORY_KEYS.forEach((category) => {
      pools[category] = [];
    });
    return pools;
  }

  function renderThemeButtons() {
    if (!els.themeButtonGrid) return;

    const buttonsHtml = THEME_BUTTON_ORDER.map((themeKey) => {
      const preset = THEME_PRESETS[themeKey];
      if (!preset) return "";

      return `
        <button
          type="button"
          class="theme-chip"
          data-theme-key="${escapeHtml(themeKey)}"
        >
          ${escapeHtml(preset.label)}
        </button>
      `;
    }).join("");

    els.themeButtonGrid.innerHTML = buttonsHtml;

    els.themeButtonGrid.querySelectorAll("[data-theme-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const themeKey = button.getAttribute("data-theme-key");
        applyThemePreset(themeKey);
      });
    });

    updateThemeButtonActiveState();
  }

  function applyThemePreset(themeKey) {
    const preset = THEME_PRESETS[themeKey];
    if (!preset) return;

    state.isApplyingPreset = true;
    state.activeThemeKey = themeKey;

    els.themeId.value = preset.id || "";
    els.themeLabel.value = preset.label || "";
    els.themeLabelEn.value = preset.labelEn || "";
    els.genreRecommendations.value = formatJson(cloneRecommendations(preset.recommendations).genres);
    els.bpmRecommendations.value = formatJson(cloneRecommendations(preset.recommendations).bpms);

    const existingTheme = findThemeByIdOrKey(preset.id, themeKey);
    const pools = existingTheme?.keywordPools || buildEmptyKeywordPools();

    CATEGORY_KEYS.forEach((category) => {
      const fieldId = CATEGORY_FIELD_MAP[category];
      const textarea = els[fieldId];
      if (!textarea) return;
      textarea.value = Array.isArray(pools[category]) ? pools[category].join("\n") : "";
    });

    state.isApplyingPreset = false;
    updateThemeButtonActiveState();
    renderPreview();
    scheduleDraftSave();
    setStatus(`"${preset.label}" 프리셋을 불러왔습니다.`, "success");
  }

  function findThemeByIdOrKey(themeId, themeKey) {
    if (!state.loadedData?.themes?.length) return null;

    return (
      state.loadedData.themes.find((theme) => theme.id === themeId) ||
      state.loadedData.themes.find((theme) => theme.id === themeKey) ||
      state.loadedData.themes.find((theme) => theme.label === THEME_PRESETS[themeKey]?.label) ||
      null
    );
  }

  function updateThemeButtonActiveState() {
    els.themeButtonGrid?.querySelectorAll("[data-theme-key]").forEach((button) => {
      const themeKey = button.getAttribute("data-theme-key");
      button.classList.toggle("is-active", themeKey === state.activeThemeKey);
    });
  }

  function clearActiveThemeSelection() {
    state.activeThemeKey = null;
    updateThemeButtonActiveState();
  }

  function handleCustomThemeMode() {
    clearActiveThemeSelection();
    maybeGenerateThemeId(true);
    renderPreview();
    scheduleDraftSave();
    setStatus("직접 입력 모드로 전환했습니다.", "warning");
  }

  function handleClearInputs() {
    const ok = window.confirm("현재 입력한 카테고리/원본 텍스트를 비울까요?");
    if (!ok) return;

    Object.values(CATEGORY_FIELD_MAP).forEach((fieldId) => {
      if (els[fieldId]) {
        els[fieldId].value = "";
      }
    });

    if (els.rawInput) els.rawInput.value = "";

    renderPreview();
    scheduleDraftSave();
    setStatus("현재 입력 내용을 비웠습니다.", "success");
  }

  function handleParseRaw() {
    const raw = els.rawInput?.value?.trim() || "";
    if (!raw) {
      setStatus("원본 텍스트가 비어 있습니다.", "warning");
      return;
    }

    const parsed = parseRawTextToPools(raw);
    let filledCount = 0;

    CATEGORY_KEYS.forEach((category) => {
      const fieldId = CATEGORY_FIELD_MAP[category];
      const textarea = els[fieldId];
      const values = parsed[category] || [];
      if (!textarea) return;
      if (values.length > 0) {
        textarea.value = values.join("\n");
        filledCount += 1;
      }
    });

    renderPreview();
    scheduleDraftSave();
    setStatus(`원본 텍스트를 ${filledCount}개 카테고리에 자동 분배했습니다.`, "success");
  }

  function parseRawTextToPools(rawText) {
    const pools = buildEmptyKeywordPools();
    const lines = rawText.split(/\r?\n/);

    let currentCategory = null;

    lines.forEach((line) => {
      const normalizedLine = line.trim();
      if (!normalizedLine) return;

      const detectedCategory = detectCategoryHeader(normalizedLine);
      if (detectedCategory) {
        currentCategory = detectedCategory;
        return;
      }

      if (!currentCategory) return;

      splitKeywords(normalizedLine).forEach((token) => {
        if (token) {
          pools[currentCategory].push(token);
        }
      });
    });

    CATEGORY_KEYS.forEach((category) => {
      pools[category] = dedupe(pools[category]);
    });

    return pools;
  }

  function detectCategoryHeader(value) {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[【】[\](){}:：\-–—]/g, "");

    const aliasMap = {
      "감정": ["감정", "emotion", "emotions", "mood", "moods"],
      "이미지": ["이미지", "장면", "image", "images", "visual", "visuals"],
      "행동": ["행동", "액션", "action", "actions", "verb", "verbs"],
      "시공간": ["시공간", "시간공간", "시간/공간", "배경", "timespace", "time", "space", "setting", "settings"],
      "영어 키워드": ["영어", "영어키워드", "english", "englishkeyword", "englishkeywords", "keyword", "keywords"]
    };

    for (const category of CATEGORY_KEYS) {
      const aliases = aliasMap[category] || [];
      if (aliases.includes(normalized)) {
        return category;
      }
    }

    return null;
  }

  function handleGenerateThemeJson() {
    const themeObject = buildCurrentThemeObject();
    if (!themeObject) return;

    els.outputJson.value = formatJson(themeObject);
    state.lastOutputType = "theme";
    state.lastDownloadName = `${themeObject.id || "theme"}.json`;
    scheduleDraftSave();
    setStatus("현재 테마 JSON을 생성했습니다.", "success");
  }

  function handleGenerateKeywordPoolsJson() {
    const pools = getKeywordPoolsFromInputs();
    els.outputJson.value = formatJson(pools);
    state.lastOutputType = "keywordPools";
    state.lastDownloadName = `${getSafeThemeId() || "keyword-pools"}-keywordPools.json`;
    scheduleDraftSave();
    setStatus("keywordPools JSON을 생성했습니다.", "success");
  }

  function handleGenerateFullDataJson() {
    const themeObject = buildCurrentThemeObject();
    if (!themeObject) return;

    const mergedData = mergeThemeIntoData(themeObject);
    els.outputJson.value = formatJson(mergedData);
    state.lastOutputType = "data";
    state.lastDownloadName = "data.json";
    scheduleDraftSave();
    setStatus("전체 data.json 병합본을 생성했습니다.", "success");
  }

  function buildCurrentThemeObject() {
    const themeId = (els.themeId?.value || "").trim();
    const label = (els.themeLabel?.value || "").trim();
    const labelEn = (els.themeLabelEn?.value || "").trim();

    if (!themeId) {
      setStatus("대주제 ID가 비어 있습니다.", "error");
      return null;
    }

    if (!label) {
      setStatus("대주제 한글명이 비어 있습니다.", "error");
      return null;
    }

    const recommendations = {
      genres: parseRecommendationArray(els.genreRecommendations?.value || "", "genre"),
      bpms: parseRecommendationArray(els.bpmRecommendations?.value || "", "bpm")
    };

    const themeObject = {
      id: themeId,
      label,
      labelEn,
      recommendations,
      keywordPools: getKeywordPoolsFromInputs()
    };

    return themeObject;
  }

  function parseRecommendationArray(rawText, type) {
    const trimmed = rawText.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) throw new Error("배열이 아닙니다.");

      return parsed
        .map((item) => normalizeRecommendationItem(item, type))
        .filter(Boolean);
    } catch (error) {
      setStatus(
        `${type === "genre" ? "추천 장르" : "추천 BPM"} JSON 형식이 올바르지 않습니다.`,
        "error"
      );
      throw error;
    }
  }

  function normalizeRecommendationItem(item, type) {
    if (!item || typeof item !== "object") return null;

    if (type === "genre") {
      const genreId = String(item.genreId || "").trim();
      if (!genreId) return null;

      return {
        genreId,
        weight: normalizeWeight(item.weight),
        reason: String(item.reason || "").trim()
      };
    }

    const bpmId = String(item.bpmId || "").trim();
    if (!bpmId) return null;

    return {
      bpmId,
      weight: normalizeWeight(item.weight),
      reason: String(item.reason || "").trim()
    };
  }

  function normalizeWeight(value) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) return num;
    return 1;
  }

  function getKeywordPoolsFromInputs() {
    const pools = {};

    CATEGORY_KEYS.forEach((category) => {
      const fieldId = CATEGORY_FIELD_MAP[category];
      const textarea = els[fieldId];
      pools[category] = splitKeywords(textarea?.value || "");
    });

    return pools;
  }

  function splitKeywords(text) {
    if (!text) return [];

    const parts = text
      .replace(/\r/g, "\n")
      .split(/\n|,/)
      .map(cleanToken)
      .filter(Boolean);

    return dedupe(parts);
  }

  function cleanToken(value) {
    if (typeof value !== "string") return "";

    return value
      .trim()
      .replace(/^[\-\•\·\●\○\▪\▫\■\□\▶\▷\➤\*]+/, "")
      .replace(/^\d+\s*[.)]\s*/, "")
      .replace(/^\d+\s*[-–—]\s*/, "")
      .trim();
  }

  function dedupe(arr) {
    const seen = new Set();
    const result = [];

    arr.forEach((item) => {
      const key = item.trim();
      if (!key) return;
      if (seen.has(key)) return;
      seen.add(key);
      result.push(key);
    });

    return result;
  }

  function mergeThemeIntoData(themeObject) {
    const base = safeDeepClone(state.loadedData || buildFallbackData());

    if (!Array.isArray(base.themes)) {
      base.themes = [];
    }

    const existingIndex = base.themes.findIndex(
      (theme) =>
        theme.id === themeObject.id ||
        theme.label === themeObject.label ||
        (themeObject.labelEn && theme.labelEn === themeObject.labelEn)
    );

    if (existingIndex >= 0) {
      base.themes[existingIndex] = themeObject;
    } else {
      base.themes.push(themeObject);
    }

    base.categoryOrder = Array.isArray(base.categoryOrder) ? base.categoryOrder : CATEGORY_KEYS.slice();
    base.genreLibrary = base.genreLibrary || GENRE_LIBRARY;
    base.bpmLibrary = base.bpmLibrary || BPM_LIBRARY;

    return base;
  }

  async function handleCopyOutput() {
    const text = els.outputJson?.value?.trim() || "";
    if (!text) {
      setStatus("복사할 출력 내용이 없습니다.", "warning");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("출력 내용을 클립보드에 복사했습니다.", "success");
    } catch (error) {
      setStatus("복사에 실패했습니다. 수동으로 복사해 주세요.", "error");
      console.warn("[admin] clipboard copy failed:", error);
    }
  }

  function handleDownloadOutput() {
    const text = els.outputJson?.value?.trim() || "";
    if (!text) {
      setStatus("다운로드할 출력 내용이 없습니다.", "warning");
      return;
    }

    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = state.lastDownloadName || "output.json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setStatus(`"${anchor.download}" 파일을 다운로드했습니다.`, "success");
  }

  function renderPreview() {
    renderCountsView();
    renderRecommendationPreview();
    renderSummaryBox();
  }

  function renderCountsView() {
    const pools = getKeywordPoolsFromInputs();

    const html = CATEGORY_KEYS.map((category) => {
      const count = pools[category]?.length || 0;
      return `
        <div class="count-item">
          <div class="count-item__name">${escapeHtml(category)}</div>
          <div class="count-item__value">${count}</div>
        </div>
      `;
    }).join("");

    if (els.countsView) {
      els.countsView.innerHTML = html;
    }
  }

  function renderRecommendationPreview() {
    let genres = [];
    let bpms = [];

    try {
      genres = parseRecommendationArray(els.genreRecommendations?.value || "[]", "genre");
    } catch (error) {
      genres = [];
    }

    try {
      bpms = parseRecommendationArray(els.bpmRecommendations?.value || "[]", "bpm");
    } catch (error) {
      bpms = [];
    }

    const genreHtml = genres.length
      ? genres.map((item) => {
          const label = GENRE_LIBRARY[item.genreId] || item.genreId;
          return `
            <div class="rec-item">
              <div class="rec-item__top">
                <span class="rec-item__name">${escapeHtml(label)}</span>
                <span class="rec-item__meta">weight ${escapeHtml(String(item.weight))}</span>
              </div>
              <div class="rec-item__reason">${escapeHtml(item.reason || "-")}</div>
            </div>
          `;
        }).join("")
      : `<div class="summary-empty">추천 장르가 없습니다.</div>`;

    const bpmHtml = bpms.length
      ? bpms.map((item) => {
          const label = BPM_LIBRARY[item.bpmId] || item.bpmId;
          return `
            <div class="rec-item">
              <div class="rec-item__top">
                <span class="rec-item__name">${escapeHtml(label)}</span>
                <span class="rec-item__meta">weight ${escapeHtml(String(item.weight))}</span>
              </div>
              <div class="rec-item__reason">${escapeHtml(item.reason || "-")}</div>
            </div>
          `;
        }).join("")
      : `<div class="summary-empty">추천 BPM이 없습니다.</div>`;

    if (els.recommendationView) {
      els.recommendationView.innerHTML = `
        <div class="rec-block">
          <h4 class="rec-block__title">추천 장르</h4>
          <div class="rec-list">${genreHtml}</div>
        </div>
        <div class="rec-block">
          <h4 class="rec-block__title">추천 BPM</h4>
          <div class="rec-list">${bpmHtml}</div>
        </div>
      `;
    }
  }

  function renderSummaryBox() {
    const pools = getKeywordPoolsFromInputs();
    const themeId = (els.themeId?.value || "").trim();
    const label = (els.themeLabel?.value || "").trim();
    const labelEn = (els.themeLabelEn?.value || "").trim();

    const categorySections = CATEGORY_KEYS.map((category) => {
      const items = pools[category] || [];
      const pills = items.length
        ? items.slice(0, 12).map((item) => `<span class="summary-pill">${escapeHtml(item)}</span>`).join("")
        : `<div class="summary-empty">입력 없음</div>`;

      return `
        <div class="summary-section">
          <h4>${escapeHtml(category)}</h4>
          <div>${pills}</div>
        </div>
      `;
    }).join("");

    if (els.summaryBox) {
      els.summaryBox.innerHTML = `
        <div class="summary-box__grid">
          <div class="summary-section">
            <h4>테마 정보</h4>
            <div><strong>ID:</strong> ${escapeHtml(themeId || "-")}</div>
            <div><strong>한글명:</strong> ${escapeHtml(label || "-")}</div>
            <div><strong>영문명:</strong> ${escapeHtml(labelEn || "-")}</div>
            <div><strong>프리셋:</strong> ${escapeHtml(state.activeThemeKey || "직접 입력")}</div>
          </div>
          <div class="summary-section">
            <h4>생성 예정</h4>
            <div>현재 테마 객체 / keywordPools / 전체 data.json 병합 생성 가능</div>
          </div>
          ${categorySections}
        </div>
      `;
    }
  }

  function maybeGenerateThemeId(force = false) {
    const currentId = (els.themeId?.value || "").trim();
    const labelEn = (els.themeLabelEn?.value || "").trim();
    const labelKo = (els.themeLabel?.value || "").trim();

    if (!force && currentId) return;
    if (state.activeThemeKey && !force) return;

    const generated = makeThemeId(labelEn || labelKo);
    if (generated && els.themeId) {
      els.themeId.value = generated;
    }
  }

  function makeThemeId(text) {
    if (!text) return "";

    const source = String(text).trim();

    const romanizedFallbackMap = {
      "사랑": "love",
      "이별": "breakup",
      "행복": "happiness",
      "슬픔": "sadness",
      "희망": "hope",
      "절망": "despair",
      "평온": "peace",
      "분노": "anger",
      "불안": "anxiety",
      "성장": "growth",
      "회상": "nostalgia",
      "만남": "meeting",
      "헤어짐": "parting",
      "시작": "beginning",
      "끝": "ending",
      "우정": "friendship",
      "배신": "betrayal",
      "밤/어둠": "night_darkness",
      "여정": "journey",
      "고독": "solitude",
      "자유": "freedom",
      "속박": "confinement",
      "도전": "challenge",
      "포기": "giving_up"
    };

    if (romanizedFallbackMap[source]) {
      return romanizedFallbackMap[source];
    }

    const asciiId = source
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[\/|]+/g, " ")
      .replace(/[^a-z0-9가-힣\s_-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

    if (/^[a-z0-9_]+$/.test(asciiId) && asciiId) {
      return asciiId;
    }

    return source
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w가-힣_]/g, "")
      .toLowerCase();
  }

  function scheduleDraftSave() {
    clearTimeout(state.autoSaveTimer);
    state.autoSaveTimer = setTimeout(saveDraft, 300);
  }

  function saveDraft() {
    try {
      const draft = {
        activeThemeKey: state.activeThemeKey,
        themeId: els.themeId?.value || "",
        themeLabel: els.themeLabel?.value || "",
        themeLabelEn: els.themeLabelEn?.value || "",
        genreRecommendations: els.genreRecommendations?.value || "",
        bpmRecommendations: els.bpmRecommendations?.value || "",
        emotionInput: els.emotionInput?.value || "",
        imageInput: els.imageInput?.value || "",
        actionInput: els.actionInput?.value || "",
        timeSpaceInput: els.timeSpaceInput?.value || "",
        englishInput: els.englishInput?.value || "",
        rawInput: els.rawInput?.value || "",
        outputJson: els.outputJson?.value || "",
        lastOutputType: state.lastOutputType,
        lastDownloadName: state.lastDownloadName
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.warn("[admin] draft save failed:", error);
    }
  }

  function restoreDraftSilently() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const draft = JSON.parse(raw);
      applyDraftToFields(draft, false);
    } catch (error) {
      console.warn("[admin] silent draft restore failed:", error);
    }
  }

  function handleRestoreDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStatus("복원할 임시저장이 없습니다.", "warning");
        return;
      }

      const draft = JSON.parse(raw);
      applyDraftToFields(draft, true);
      setStatus("임시저장을 복원했습니다.", "success");
    } catch (error) {
      console.warn("[admin] draft restore failed:", error);
      setStatus("임시저장 복원에 실패했습니다.", "error");
    }
  }

  function applyDraftToFields(draft, announce = false) {
    if (!draft || typeof draft !== "object") return;

    state.activeThemeKey = draft.activeThemeKey || null;

    if (els.themeId) els.themeId.value = draft.themeId || "";
    if (els.themeLabel) els.themeLabel.value = draft.themeLabel || "";
    if (els.themeLabelEn) els.themeLabelEn.value = draft.themeLabelEn || "";
    if (els.genreRecommendations) els.genreRecommendations.value = draft.genreRecommendations || "";
    if (els.bpmRecommendations) els.bpmRecommendations.value = draft.bpmRecommendations || "";

    if (els.emotionInput) els.emotionInput.value = draft.emotionInput || "";
    if (els.imageInput) els.imageInput.value = draft.imageInput || "";
    if (els.actionInput) els.actionInput.value = draft.actionInput || "";
    if (els.timeSpaceInput) els.timeSpaceInput.value = draft.timeSpaceInput || "";
    if (els.englishInput) els.englishInput.value = draft.englishInput || "";
    if (els.rawInput) els.rawInput.value = draft.rawInput || "";
    if (els.outputJson) els.outputJson.value = draft.outputJson || "";

    state.lastOutputType = draft.lastOutputType || "theme";
    state.lastDownloadName = draft.lastDownloadName || "theme.json";

    updateThemeButtonActiveState();
    renderPreview();

    if (announce) {
      setStatus("임시저장을 불러왔습니다.", "success");
    }
  }

  function handleClearDraft() {
    const ok = window.confirm("브라우저에 저장된 임시저장을 삭제할까요?");
    if (!ok) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      setStatus("임시저장을 삭제했습니다.", "success");
    } catch (error) {
      console.warn("[admin] draft clear failed:", error);
      setStatus("임시저장 삭제에 실패했습니다.", "error");
    }
  }

  function cloneRecommendations(recommendations) {
    const safe = recommendations || {};
    return {
      genres: Array.isArray(safe.genres) ? safeDeepClone(safe.genres) : [],
      bpms: Array.isArray(safe.bpms) ? safeDeepClone(safe.bpms) : []
    };
  }

  function safeDeepClone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      return value;
    }
  }

  function getSafeThemeId() {
    return (els.themeId?.value || "").trim() || "theme";
  }

  function setStatus(message, type = "") {
    if (!els.statusText) return;

    const bar = els.statusText.parentElement;
    els.statusText.textContent = message;

    if (bar) {
      bar.classList.remove("is-success", "is-warning", "is-error");
      if (type === "success") bar.classList.add("is-success");
      if (type === "warning") bar.classList.add("is-warning");
      if (type === "error") bar.classList.add("is-error");
    }
  }

  function formatJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
});
