'use strict';

const STORAGE_KEY   = 'quiz_answers_v1';
const FILENAME_KEY  = 'quiz_last_file';
const GIFT_TEXT_KEY = 'quiz_last_gift_v1';

function loadStoredAnswers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveAnswer(question) {
  const stored = loadStoredAnswers();
  stored[question.id] = {
    answered: question.answered,
    correct: question.correct,
    selectedIndices: question.selectedIndices,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function applyStoredAnswers(questions) {
  const stored = loadStoredAnswers();
  for (const q of questions) {
    if (stored[q.id]) {
      q.answered        = stored[q.id].answered;
      q.correct         = stored[q.id].correct;
      q.selectedIndices = stored[q.id].selectedIndices || [];
    }
  }
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

// Persist the raw GIFT text so the last file auto-restores on next visit.
// Quota overflow (or Safari private mode) just skips persistence.
function persistGift(fileName, text) {
  try {
    localStorage.setItem(FILENAME_KEY, fileName);
    localStorage.setItem(GIFT_TEXT_KEY, text);
  } catch { /* storage unavailable — session still works */ }
}

function loadSavedGiftText() {
  try { return localStorage.getItem(GIFT_TEXT_KEY); }
  catch { return null; }
}
