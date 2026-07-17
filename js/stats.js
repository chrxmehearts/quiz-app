'use strict';

// Score at or above this colors the score stat green, below it red.
const SCORE_GOOD_THRESHOLD = 65;

function updateStats() {
  const total    = allQuestions.length;
  const answered = allQuestions.filter(q => q.answered).length;
  const correct  = allQuestions.filter(q => q.answered && q.correct).length;
  const wrong    = allQuestions.filter(q => q.answered && !q.correct).length;
  const pct      = answered ? Math.round((correct / answered) * 100) : null;

  statTotal.textContent    = total;
  statAnswered.textContent = answered;
  statCorrect.textContent  = correct;
  statWrong.textContent    = wrong;
  statPct.textContent      = pct !== null ? pct + '%' : '—';

  statScoreEl.classList.toggle('pass', pct !== null && pct >= SCORE_GOOD_THRESHOLD);
  statScoreEl.classList.toggle('fail', pct !== null && pct < SCORE_GOOD_THRESHOLD);

  const correctW = total ? (correct / total * 100) : 0;
  const wrongW   = total ? (wrong   / total * 100) : 0;
  progressCorrect.style.width = correctW + '%';
  progressWrong.style.left    = correctW + '%';
  progressWrong.style.width   = wrongW + '%';
}
