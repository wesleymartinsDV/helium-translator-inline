// ui/balloon.js
const translatedTextDiv = document.getElementById('translated-text');
const copyBtn = document.getElementById('copy-btn');

let currentText = '';

// Listen for message from content script
window.addEventListener('message', (event) => {
  if (event.data.action === 'display-text') {
    currentText = event.data.translatedText;
    translatedTextDiv.textContent = currentText;
  }
});

// Handle copy button click
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(currentText).then(() => {
    copyBtn.textContent = 'Copiado!';
    setTimeout(() => {
      copyBtn.textContent = 'Copiar';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
});