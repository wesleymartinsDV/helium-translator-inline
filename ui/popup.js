// Translate all elements with data-i18n attributes
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const languages = [
    { code: "pt-BR", name: "Português (Brasil)", flag: "BR" },
    { code: "pt-PT", name: "Português (Portugal)", flag: "PT" },
    { code: "en", name: "English", flag: "US" },
    { code: "es", name: "Español", flag: "ES" },
    { code: "fr", name: "Français", flag: "FR" },
    { code: "de", name: "Deutsch", flag: "DE" },
    { code: "it", name: "Italiano", flag: "IT" },
    { code: "ja", name: "日本語", flag: "JP" },
    { code: "ko", name: "한국어", flag: "KR" },
    { code: "zh-CN", name: "中文 (简体)", flag: "CN" },
    { code: "zh-TW", name: "中文 (繁體)", flag: "TW" },
    { code: "ru", name: "Русский", flag: "RU" },
    { code: "uk", name: "Українська", flag: "UA" },
    { code: "ar", name: "العربية", flag: "SA" },
    { code: "he", name: "עברית", flag: "IL" },
    { code: "fa", name: "فارسی", flag: "IR" },
    { code: "ur", name: "اردو", flag: "PK" },
    { code: "hi", name: "हिन्दी", flag: "IN" },
    { code: "bn", name: "বাংলা", flag: "BD" },
    { code: "th", name: "ไทย", flag: "TH" },
    { code: "vi", name: "Tiếng Việt", flag: "VN" },
    { code: "id", name: "Bahasa Indonesia", flag: "ID" },
    { code: "ms", name: "Bahasa Melayu", flag: "MY" },
    { code: "tl", name: "Filipino", flag: "PH" },
    { code: "nl", name: "Nederlands", flag: "NL" },
    { code: "pl", name: "Polski", flag: "PL" },
    { code: "tr", name: "Türkçe", flag: "TR" },
    { code: "el", name: "Ελληνικά", flag: "GR" },
    { code: "cs", name: "Čeština", flag: "CZ" },
    { code: "sk", name: "Slovenčina", flag: "SK" },
    { code: "hu", name: "Magyar", flag: "HU" },
    { code: "ro", name: "Română", flag: "RO" },
    { code: "bg", name: "Български", flag: "BG" },
    { code: "hr", name: "Hrvatski", flag: "HR" },
    { code: "sv", name: "Svenska", flag: "SE" },
    { code: "da", name: "Dansk", flag: "DK" },
    { code: "nb", name: "Norsk", flag: "NO" },
    { code: "fi", name: "Suomi", flag: "FI" },
  ];

  const FLAG_SOURCES = {
    BR: chrome.runtime.getURL("icons/flags/br.svg"),
    PT: chrome.runtime.getURL("icons/flags/pt.svg"),
    US: chrome.runtime.getURL("icons/flags/us.svg"),
    ES: chrome.runtime.getURL("icons/flags/es.svg"),
    FR: chrome.runtime.getURL("icons/flags/fr.svg"),
    DE: chrome.runtime.getURL("icons/flags/de.svg"),
    IT: chrome.runtime.getURL("icons/flags/it.svg"),
    JP: chrome.runtime.getURL("icons/flags/jp.svg"),
    KR: chrome.runtime.getURL("icons/flags/kr.svg"),
    CN: chrome.runtime.getURL("icons/flags/cn.svg"),
    TW: chrome.runtime.getURL("icons/flags/tw.svg"),
    RU: chrome.runtime.getURL("icons/flags/ru.svg"),
    UA: chrome.runtime.getURL("icons/flags/ua.svg"),
    SA: chrome.runtime.getURL("icons/flags/sa.svg"),
    IL: chrome.runtime.getURL("icons/flags/il.svg"),
    IR: chrome.runtime.getURL("icons/flags/ir.svg"),
    PK: chrome.runtime.getURL("icons/flags/pk.svg"),
    IN: chrome.runtime.getURL("icons/flags/in.svg"),
    BD: chrome.runtime.getURL("icons/flags/bd.svg"),
    TH: chrome.runtime.getURL("icons/flags/th.svg"),
    VN: chrome.runtime.getURL("icons/flags/vn.svg"),
    ID: chrome.runtime.getURL("icons/flags/id.svg"),
    MY: chrome.runtime.getURL("icons/flags/my.svg"),
    PH: chrome.runtime.getURL("icons/flags/ph.svg"),
    NL: chrome.runtime.getURL("icons/flags/nl.svg"),
    PL: chrome.runtime.getURL("icons/flags/pl.svg"),
    TR: chrome.runtime.getURL("icons/flags/tr.svg"),
    GR: chrome.runtime.getURL("icons/flags/gr.svg"),
    CZ: chrome.runtime.getURL("icons/flags/cz.svg"),
    SK: chrome.runtime.getURL("icons/flags/sk.svg"),
    HU: chrome.runtime.getURL("icons/flags/hu.svg"),
    RO: chrome.runtime.getURL("icons/flags/ro.svg"),
    BG: chrome.runtime.getURL("icons/flags/bg.svg"),
    HR: chrome.runtime.getURL("icons/flags/hr.svg"),
    SE: chrome.runtime.getURL("icons/flags/se.svg"),
    DK: chrome.runtime.getURL("icons/flags/dk.svg"),
    NO: chrome.runtime.getURL("icons/flags/no.svg"),
    FI: chrome.runtime.getURL("icons/flags/fi.svg"),
  };

  let selectedLangCode;
  let favorites;
  let isDark;
  let flagEmojiSupported = true;
  let searchTerm = "";

  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const selectedLangBtn = document.getElementById("selectedLang");
  const dropdown = document.getElementById("dropdown");
  const langName = document.getElementById("langName");
  const langFlag = document.getElementById("langFlag");
  const searchBox = document.getElementById("searchBox");
  const favoritesSection = document.getElementById("favoritesSection");
  const favoritesList = document.getElementById("favoritesList");
  const allLanguages = document.getElementById("allLanguages");

  // --- Preference Management ---
  async function savePreferences() {
    // Map UI codes to Google Translate API codes
    const langCodeMap = {
      "pt-BR": "pt",
      "pt-PT": "pt",
      "zh-CN": "zh-CN",
      "zh-TW": "zh-TW",
      nb: "no", // Google Translate uses 'no' for Norwegian
      tl: "fil", // Google Translate uses 'fil' for Filipino
    };

    const targetLang = langCodeMap[selectedLangCode] || selectedLangCode;

    const prefs = {
      theme: isDark ? "dark" : "light",
      favoriteLangs: favorites,
      targetLanguage: targetLang,
      uiLanguage: currentLanguage,
    };
    await chrome.storage.sync.set(prefs);
  }

  async function loadPreferences() {
    // Detect system theme
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Detect system language
    const systemLang = getSystemLanguage();

    const data = await chrome.storage.sync.get({
      theme: systemPrefersDark ? "dark" : "light",
      favoriteLangs: ["en", "es"],
      targetLanguage: systemLang,
      uiLanguage: systemLang,
    });

    isDark = data.theme === "dark";
    favorites = data.favoriteLangs;
    currentLanguage = data.uiLanguage;

    // Map stored language codes back to UI codes
    const storedToUIMap = {
      pt: "pt-BR",
      no: "nb",
    };

    let targetLang = data.targetLanguage;
    if (storedToUIMap[targetLang]) {
      targetLang = storedToUIMap[targetLang];
    }

    const matchingLang =
      languages.find((l) => l.code === targetLang) ||
      languages.find((l) => l.code.startsWith(targetLang)) ||
      languages[0];
    selectedLangCode = matchingLang.code;

    updateUIForPreferences();
    applyTranslations(); // Apply UI translations after loading preferences
  }

  function updateUIForPreferences() {
    body.className = isDark ? "dark" : "light";
    themeToggle.textContent = isDark ? "☀️" : "🌙";

    const lang = languages.find((l) => l.code === selectedLangCode);
    if (lang) {
      setFlagContent(langFlag, lang.flag);
      langName.textContent = lang.name;
    }

    applyTranslations(); // Re-apply translations when theme or language changes
  }

  function countryCodeToEmoji(countryCode) {
    const base = 0x1f1e6 - "A".charCodeAt(0);
    return (
      String.fromCodePoint(base + countryCode.charCodeAt(0)) +
      String.fromCodePoint(base + countryCode.charCodeAt(1))
    );
  }

  // --- UI Logic ---
  function toggleTheme() {
    isDark = !isDark;
    body.className = isDark ? "dark" : "light";
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    savePreferences();
  }

  async function toggleFavorite(code) {
    const index = favorites.indexOf(code);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(code);
    }
    await savePreferences();
    renderLanguages();
  }

  async function selectLanguage(code) {
    selectedLangCode = code;
    const lang = languages.find((l) => l.code === code);
    setFlagContent(langFlag, lang.flag);
    langName.textContent = lang.name;
    dropdown.classList.remove("active");
    searchBox.value = "";
    searchTerm = "";
    await savePreferences();
    renderLanguages();
  }

  function renderLanguages() {
    favoritesList.innerHTML = "";
    allLanguages.innerHTML = "";

    const filtered = languages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const favLangs = filtered.filter((lang) =>
      favorites.includes(lang.code.split("-")[0])
    );

    if (favLangs.length > 0 && !searchTerm) {
      favoritesSection.style.display = "block";
      favLangs.forEach((lang) => {
        favoritesList.appendChild(createLanguageOption(lang));
      });
    } else {
      favoritesSection.style.display = "none";
    }

    filtered.forEach((lang) => {
      allLanguages.appendChild(createLanguageOption(lang));
    });
  }

  function createLanguageOption(lang) {
    const option = document.createElement("div");
    option.className =
      "language-option" + (lang.code === selectedLangCode ? " selected" : "");

    const leftContent = document.createElement("div");
    leftContent.className = "left-content";

    const flag = document.createElement("span");
    flag.className = "flag";
    setFlagContent(flag, lang.flag);

    const name = document.createElement("span");
    name.textContent = lang.name;

    leftContent.appendChild(flag);
    leftContent.appendChild(name);

    const star = document.createElement("div");
    star.className =
      "star" + (favorites.includes(lang.code.split("-")[0]) ? " active" : "");
    star.textContent = "♥";
    star.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(lang.code.split("-")[0]);
    });

    option.appendChild(leftContent);
    option.appendChild(star);

    option.addEventListener("click", () => selectLanguage(lang.code));

    return option;
  }

  // --- Event Listeners ---
  themeToggle.addEventListener("click", toggleTheme);

  selectedLangBtn.addEventListener("click", () => {
    dropdown.classList.toggle("active");
    if (dropdown.classList.contains("active")) {
      setTimeout(() => searchBox.focus(), 100);
    }
  });

  searchBox.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderLanguages();
  });

  searchBox.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".language-selector")) {
      dropdown.classList.remove("active");
    }
  });

  // --- Initial Load ---
  flagEmojiSupported = detectFlagEmojiSupport();
  await loadPreferences();
  renderLanguages();

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      isDark = e.matches;
      updateUIForPreferences();
      savePreferences();
    });

  function detectFlagEmojiSupport() {
    const testSpan = document.createElement("span");
    testSpan.style.position = "absolute";
    testSpan.style.visibility = "hidden";
    testSpan.style.fontSize = "20px";
    testSpan.style.lineHeight = "1";
    testSpan.textContent = countryCodeToEmoji("BR");
    document.body.appendChild(testSpan);
    const emojiWidth = testSpan.offsetWidth;
    testSpan.textContent = "BR";
    const textWidth = testSpan.offsetWidth;
    testSpan.remove();
    return emojiWidth !== textWidth;
  }

  function getFlagAsset(code) {
    if (!code) return undefined;
    return FLAG_SOURCES[code.toUpperCase()];
  }

  function setFlagContent(element, countryCode) {
    if (!element) return;
    element.innerHTML = "";
    element.classList.remove("has-image");

    if (!countryCode) {
      element.textContent = "";
      return;
    }

    const assetPath = getFlagAsset(countryCode);
    if (assetPath) {
      element.classList.add("has-image");
      const img = document.createElement("img");
      img.src = assetPath;
      img.alt = countryCodeToEmoji(countryCode);
      img.width = 36;
      img.height = 36;
      img.decoding = "async";
      img.loading = "lazy";
      element.appendChild(img);
      return;
    }

    if (flagEmojiSupported) {
      element.textContent = countryCodeToEmoji(countryCode);
    } else {
      element.textContent = countryCode;
    }
  }

  // Listen for system language changes
  window.addEventListener("change", (e) => {
    if (e.matches === false) return; // Only process when media query becomes true
    // Re-detect system language and update UI
    const newSystemLang = getSystemLanguage();
    if (newSystemLang !== currentLanguage) {
      currentLanguage = newSystemLang;
      applyTranslations();
      savePreferences();
    }
  });
});
