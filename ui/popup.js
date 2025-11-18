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
    { code: "en", name: "English", flag: "US" },
    { code: "es", name: "Español", flag: "ES" },
    { code: "fr", name: "Français", flag: "FR" },
    { code: "de", name: "Deutsch", flag: "DE" },
    { code: "it", name: "Italiano", flag: "IT" },
    { code: "ja", name: "日本語", flag: "JP" },
    { code: "ko", name: "한국어", flag: "KR" },
    { code: "zh", name: "中文", flag: "CN" },
    { code: "ru", name: "Русский", flag: "RU" },
    { code: "ar", name: "العربية", flag: "SA" },
    { code: "hi", name: "हिन्दी", flag: "IN" },
    { code: "nl", name: "Nederlands", flag: "NL" },
    { code: "pl", name: "Polski", flag: "PL" },
    { code: "tr", name: "Türkçe", flag: "TR" },
    { code: "sv", name: "Svenska", flag: "SE" },
    { code: "da", name: "Dansk", flag: "DK" },
    { code: "no", name: "Norsk", flag: "NO" },
    { code: "fi", name: "Suomi", flag: "FI" },
  ];

  const FLAG_SOURCES = {
    BR: chrome.runtime.getURL("icons/flags/br.svg"),
    US: chrome.runtime.getURL("icons/flags/us.svg"),
    ES: chrome.runtime.getURL("icons/flags/es.svg"),
    FR: chrome.runtime.getURL("icons/flags/fr.svg"),
    DE: chrome.runtime.getURL("icons/flags/de.svg"),
    IT: chrome.runtime.getURL("icons/flags/it.svg"),
    JP: chrome.runtime.getURL("icons/flags/jp.svg"),
    KR: chrome.runtime.getURL("icons/flags/kr.svg"),
    CN: chrome.runtime.getURL("icons/flags/cn.svg"),
    RU: chrome.runtime.getURL("icons/flags/ru.svg"),
    SA: chrome.runtime.getURL("icons/flags/sa.svg"),
    IN: chrome.runtime.getURL("icons/flags/in.svg"),
    NL: chrome.runtime.getURL("icons/flags/nl.svg"),
    PL: chrome.runtime.getURL("icons/flags/pl.svg"),
    TR: chrome.runtime.getURL("icons/flags/tr.svg"),
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
    const prefs = {
      theme: isDark ? "dark" : "light",
      favoriteLangs: favorites,
      targetLanguage: selectedLangCode.split("-")[0], // Save 'pt', not 'pt-BR'
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

    const matchingLang =
      languages.find((l) => l.code.startsWith(data.targetLanguage)) ||
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
