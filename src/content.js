// src/content.js
console.log("Helium Translator Inline: Content script v8 loaded and active!");

const TRANSLATION_SEPARATOR = "\n\n[-HTS-]\n\n";

// Global state for full-page translation
let pageOriginals = new Map();
let isPageTranslated = false;

// Global state for selection translation
let selectionOriginals = new Map();
let lastTranslatedNodes = [];
let isSelectionTranslated = false;

const translationCache = new Map();
let currentTargetLanguage = "en";

function getTargetLanguageFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ targetLanguage: "en" }, (data) => {
      resolve(data.targetLanguage || "en");
    });
  });
}

// Main listener for commands from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate-selection") {
    if (isSelectionTranslated) {
      revertSelectionTranslation();
    } else {
      handleSelectionTranslation();
    }
  } else if (request.action === "translate-full-page") {
    if (isPageTranslated) {
      console.log(
        "Helium Translator Inline: Page is already translated. Reverting now."
      );
      revertPageTranslation();
    } else {
      handleFullPageTranslation();
    }
  } else if (request.action === "revert-translation") {
    revertPageTranslation();
  }
  return true;
});

// Keyboard shortcuts (fixed)
document.addEventListener("keydown", async (e) => {
  const pressedKey =
    (e.ctrlKey ? "ctrl+" : "") +
    (e.shiftKey ? "shift+" : "") +
    (e.altKey ? "alt+" : "") +
    e.key.toLowerCase();

  console.log("Helium Translator Inline: Key pressed:", pressedKey);

  // Translate/revert selection with Shift+Alt+Q
  if (pressedKey === "shift+alt+q") {
    console.log("Helium Translator Inline: Shift+Alt+Q detected!");
    e.preventDefault();
    const selection = window.getSelection();

    if (isSelectionTranslated) {
      console.log("Helium Translator Inline: Reverting selection translation");
      revertSelectionTranslation();
    } else if (selection && !selection.isCollapsed) {
      console.log("Helium Translator Inline: Translating selection");
      await handleSelectionTranslation();
    } else {
      console.log("Helium Translator Inline: No selection to translate");
    }
  }

  // Translate/revert full page with Shift+Alt+W
  if (pressedKey === "shift+alt+w") {
    console.log("Helium Translator Inline: Shift+Alt+W detected!");
    e.preventDefault();

    if (isPageTranslated) {
      console.log("Helium Translator Inline: Reverting page translation");
      revertPageTranslation();
    } else {
      console.log("Helium Translator Inline: Translating full page");
      await handleFullPageTranslation();
    }
  }
});

// Handles translating the current user selection
async function handleSelectionTranslation() {
  console.log("Helium Translator Inline: handleSelectionTranslation called");
  const selection = window.getSelection();

  if (!selection.rangeCount || selection.isCollapsed) {
    console.log("Helium Translator Inline: No valid selection");
    return;
  }

  const range = selection.getRangeAt(0);
  console.log("Helium Translator Inline: Range obtained", {
    startContainer: range.startContainer,
    endContainer: range.endContainer,
    commonAncestor: range.commonAncestorContainer,
  });

  const textNodes = collectTextNodesFromRange(range);
  console.log(
    `Helium Translator Inline: Collected ${textNodes.length} text nodes`
  );

  if (!textNodes.length) {
    console.log("Helium Translator Inline: No text nodes found in selection.");
    return;
  }

  const joinedText = textNodes
    .map((node) => node.nodeValue)
    .join(TRANSLATION_SEPARATOR);

  let response;
  try {
    response = await chrome.runtime.sendMessage({
      action: "getTranslation",
      text: joinedText,
    });
  } catch (error) {
    console.error(
      "Helium Translator Inline: Failed to translate selection.",
      error
    );
    return;
  }

  if (!response || typeof response.translatedText !== "string") {
    console.error(
      "Helium Translator Inline: Invalid selection translation response.",
      response
    );
    return;
  }

  const translatedTexts = response.translatedText.split(TRANSLATION_SEPARATOR);
  if (translatedTexts.length !== textNodes.length) {
    console.error("Helium Translator Inline: Selection translation mismatch.", {
      expected: textNodes.length,
      received: translatedTexts.length,
    });
    return;
  }

  // Store originals for undo
  textNodes.forEach((node, index) => {
    if (node.isConnected) {
      if (!selectionOriginals.has(node)) {
        selectionOriginals.set(node, node.nodeValue);
      }
      node.nodeValue = translatedTexts[index];
    }
  });

  lastTranslatedNodes = textNodes;
  isSelectionTranslated = true;
  selection.removeAllRanges();
}

// Reverts the last selection translation
function revertSelectionTranslation() {
  console.log("Helium Translator Inline: Reverting selection translation.");
  for (const node of lastTranslatedNodes) {
    if (node.isConnected && selectionOriginals.has(node)) {
      node.nodeValue = selectionOriginals.get(node);
    }
  }
  selectionOriginals.clear();
  lastTranslatedNodes = [];
  isSelectionTranslated = false;
}

function collectTextNodesFromRange(range) {
  if (!range) {
    console.log(
      "Helium Translator Inline: No range provided to collectTextNodesFromRange"
    );
    return [];
  }

  const textNodes = [];
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    null
  );

  const rootNode = walker.currentNode;
  if (
    rootNode &&
    rootNode.nodeType === Node.TEXT_NODE &&
    rootNode.nodeValue.trim() &&
    range.intersectsNode(rootNode)
  ) {
    textNodes.push(rootNode);
  }

  let node;
  while ((node = walker.nextNode())) {
    if (range.intersectsNode(node) && node.nodeValue.trim()) {
      textNodes.push(node);
    }
  }

  console.log(
    `Helium Translator Inline: collectTextNodesFromRange found ${textNodes.length} nodes`
  );
  return textNodes;
}

// Handles translating all text nodes on the page
async function handleFullPageTranslation() {
  console.log(
    "Helium Translator Inline: Starting full page translation with batching."
  );
  isPageTranslated = true;
  currentTargetLanguage = await getTargetLanguageFromStorage();

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (
          node.parentElement.closest(
            'script, style, textarea, [contenteditable="true"]'
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        if (node.nodeValue.trim() === "") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const nodesToTranslate = [];
  while (walker.nextNode()) {
    nodesToTranslate.push(walker.currentNode);
  }

  for (const node of nodesToTranslate) {
    if (!pageOriginals.has(node)) {
      pageOriginals.set(node, node.nodeValue);
    }
  }

  await translateNodesInBatches(nodesToTranslate);

  console.log(
    `Helium Translator Inline: Finished. Translated ${pageOriginals.size} text nodes.`
  );
}

async function translateNodesInBatches(nodes) {
  const BATCH_CHAR_LIMIT = 4500;
  const MAX_PARALLEL_REQUESTS = 3;

  const batches = [];
  let currentBatch = [];
  let currentCount = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeText = pageOriginals.get(node) || "";

    if (
      currentBatch.length > 0 &&
      currentCount + nodeText.length > BATCH_CHAR_LIMIT
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentCount = 0;
    }

    currentBatch.push(node);
    currentCount += nodeText.length;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  const queue = batches.slice();
  const running = [];

  while (queue.length > 0 || running.length > 0) {
    while (queue.length > 0 && running.length < MAX_PARALLEL_REQUESTS) {
      const batch = queue.shift();
      const promise = processBatch(batch).finally(() => {
        const index = running.indexOf(promise);
        if (index !== -1) {
          running.splice(index, 1);
        }
      });
      running.push(promise);
    }

    if (running.length > 0) {
      await Promise.race(running);
    }
  }

  async function processBatch(nodeBatch) {
    if (!nodeBatch || nodeBatch.length === 0) {
      return;
    }

    const originalTexts = nodeBatch.map((n) => pageOriginals.get(n) || "");
    const cacheKeys = originalTexts.map(
      (text) => `${currentTargetLanguage}|${text}`
    );
    const results = new Array(nodeBatch.length).fill(undefined);

    const textsToTranslate = [];
    const translationIndices = [];

    for (let i = 0; i < nodeBatch.length; i++) {
      const cachedValue = translationCache.get(cacheKeys[i]);
      if (cachedValue !== undefined) {
        results[i] = cachedValue;
      } else {
        textsToTranslate.push(originalTexts[i]);
        translationIndices.push(i);
      }
    }

    if (textsToTranslate.length > 0) {
      const joinedText = textsToTranslate.join(TRANSLATION_SEPARATOR);

      try {
        const response = await chrome.runtime.sendMessage({
          action: "getTranslation",
          text: joinedText,
        });

        const translatedJoinedText = response?.translatedText || "";
        const translatedTexts = translatedJoinedText.split(
          TRANSLATION_SEPARATOR
        );

        if (translatedTexts.length === textsToTranslate.length) {
          translationIndices.forEach((batchIndex, resultIndex) => {
            const translatedText = translatedTexts[resultIndex];
            results[batchIndex] = translatedText;
            translationCache.set(cacheKeys[batchIndex], translatedText);
          });
        } else {
          console.error(
            "Helium Translator Inline: Batch translation mismatch.",
            {
              originalCount: textsToTranslate.length,
              translatedCount: translatedTexts.length,
            }
          );
        }
      } catch (e) {
        console.error(
          "Helium Translator Inline: Failed to process a batch.",
          e
        );
      }
    }

    for (let i = 0; i < nodeBatch.length; i++) {
      const nodeToUpdate = nodeBatch[i];
      if (results[i] !== undefined && nodeToUpdate.isConnected) {
        nodeToUpdate.nodeValue = results[i];
      }
    }
  }
}

// Reverts the full page translation
function revertPageTranslation() {
  console.log("Helium Translator Inline: Reverting page translation.");
  for (const [node, originalText] of pageOriginals.entries()) {
    if (node.isConnected) {
      node.nodeValue = originalText;
    }
  }
  pageOriginals.clear();
  isPageTranslated = false;
}
