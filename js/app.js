'use strict';

/* ── State ── */
let allQuestions      = [];
let displayedQuestions = [];
let currentTopic      = 'All';
let filterMode        = null; // 'wrong' | 'unanswered' | null
let currentFileName   = null;
let rawGiftText       = null;

/* ── DOM refs ── */
const fileInput      = document.getElementById('file-input');
const fileNameEl     = document.getElementById('file-name');
const quizContainer  = document.getElementById('quiz-container');
const emptyState     = document.getElementById('empty-state');
const errorState     = document.getElementById('error-state');
const topicTabs      = document.getElementById('topic-tabs');
const progressCorrect = document.getElementById('progress-correct');
const progressWrong   = document.getElementById('progress-wrong');
const statAnswered   = document.getElementById('stat-answered');
const statCorrect    = document.getElementById('stat-correct');
const statWrong      = document.getElementById('stat-wrong');
const statPct        = document.getElementById('stat-pct');
const statTotal      = document.getElementById('stat-total');
const statScoreEl    = document.getElementById('stat-score');
const btnWrong       = document.getElementById('btn-wrong');
const btnUnanswered  = document.getElementById('btn-unanswered');
const btnShuffle     = document.getElementById('btn-shuffle');
const btnReset       = document.getElementById('btn-reset');
const btnSaveOffline = document.getElementById('btn-save-offline');
const dropOverlay    = document.getElementById('drop-overlay');

/* ── File loading ── */
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  fileInput.value = '';
  loadFile(file);
});

function loadFile(file) {
  if (!/\.(gift|txt)$/i.test(file.name)) {
    showError('Wrong file type — please select a .gift or .txt file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => loadGift(ev.target.result, file.name);
  reader.readAsText(file, 'UTF-8');
}

function loadGift(text, fileName) {
  errorState.style.display = 'none';
  try {
    const parsed = parseGiftFile(text);
    if (!parsed.length) throw new Error('No valid questions found in file.');
    allQuestions = parsed;
    shuffleAnswerOrders(allQuestions);
    applyStoredAnswers(allQuestions);
    rawGiftText = text;
    if (fileName) {
      currentFileName = fileName;
      fileNameEl.textContent = fileName;
      persistGift(fileName, text);
    }
    currentTopic = 'All';
    filterMode   = null;
    btnWrong.classList.remove('active');
    btnUnanswered.classList.remove('active');
    emptyState.style.display = 'none';
    btnSaveOffline.classList.add('visible');
    renderTopicTabs();
    applyFilterAndRender();
  } catch (err) {
    showError(err.message);
  }
}

function showError(msg) {
  errorState.textContent = 'Parse error: ' + msg;
  errorState.style.display = 'block';
}

/* ── Drag & drop loading ── */
let dragDepth = 0;

function dragHasFiles(e) {
  return e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');
}

window.addEventListener('dragenter', e => {
  if (!dragHasFiles(e)) return;
  e.preventDefault();
  dragDepth++;
  dropOverlay.classList.add('visible');
});

window.addEventListener('dragover', e => {
  if (dragHasFiles(e)) e.preventDefault();
});

window.addEventListener('dragleave', e => {
  if (!dragHasFiles(e)) return;
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) dropOverlay.classList.remove('visible');
});

window.addEventListener('drop', e => {
  if (!dragHasFiles(e)) return;
  e.preventDefault();
  dragDepth = 0;
  dropOverlay.classList.remove('visible');
  const file = e.dataTransfer.files[0];
  if (file) loadFile(file);
});

/* ── Controls ── */
btnWrong.addEventListener('click', () => {
  filterMode = filterMode === 'wrong' ? null : 'wrong';
  btnWrong.classList.toggle('active', filterMode === 'wrong');
  btnUnanswered.classList.remove('active');
  applyFilterAndRender();
});

btnUnanswered.addEventListener('click', () => {
  filterMode = filterMode === 'unanswered' ? null : 'unanswered';
  btnUnanswered.classList.toggle('active', filterMode === 'unanswered');
  btnWrong.classList.remove('active');
  applyFilterAndRender();
});

btnShuffle.addEventListener('click', () => {
  shuffleAnswerOrders(allQuestions);
  displayedQuestions = shuffle(displayedQuestions);
  renderQuestions(displayedQuestions);
});

/* Reset is destructive — first click arms the button, second click resets. */
let resetTimer = null;

btnReset.addEventListener('click', () => {
  if (!allQuestions.length) return;
  if (!btnReset.classList.contains('armed')) {
    btnReset.classList.add('armed');
    btnReset.textContent = 'Confirm reset?';
    resetTimer = setTimeout(disarmReset, 3500);
    return;
  }
  disarmReset();
  for (const q of allQuestions) {
    q.answered = false;
    q.correct  = null;
    q.selectedIndices = [];
  }
  clearStorage();
  shuffleAnswerOrders(allQuestions);
  filterMode = null;
  btnWrong.classList.remove('active');
  btnUnanswered.classList.remove('active');
  applyFilterAndRender();
});

function disarmReset() {
  clearTimeout(resetTimer);
  btnReset.classList.remove('armed');
  btnReset.textContent = 'Reset All';
}

btnSaveOffline.addEventListener('click', saveEmbedded);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Randomize the display order of each question's options so answer positions
// can't be memorized. selectedIndices always store original answer indices.
function shuffleAnswerOrders(questions) {
  for (const q of questions) {
    q.displayOrder = shuffle(q.answers.map((_, i) => i));
  }
}

/* ── Init ── */
updateStats();

if (window.__EMBEDDED_GIFT__) {
  fileNameEl.textContent = 'Embedded quiz';
  loadGift(window.__EMBEDDED_GIFT__);
} else {
  const savedText = loadSavedGiftText();
  const savedName = localStorage.getItem(FILENAME_KEY);
  if (savedText) {
    if (savedName) {
      currentFileName = savedName;
      fileNameEl.textContent = savedName;
    }
    loadGift(savedText);
  } else if (savedName) {
    fileNameEl.textContent = `Last: ${savedName}`;
  }
}
