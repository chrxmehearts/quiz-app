'use strict';

// Score coloring tiers: above SCORE_GOOD is green, SCORE_MID..SCORE_GOOD is
// yellow, below SCORE_MID is red.
const SCORE_GOOD = 75;
const SCORE_MID  = 51;

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

  statScoreEl.classList.toggle('pass', pct !== null && pct > SCORE_GOOD);
  statScoreEl.classList.toggle('mid',  pct !== null && pct >= SCORE_MID && pct <= SCORE_GOOD);
  statScoreEl.classList.toggle('fail', pct !== null && pct < SCORE_MID);

  const correctW = total ? (correct / total * 100) : 0;
  const wrongW   = total ? (wrong   / total * 100) : 0;
  progressCorrect.style.width = correctW + '%';
  progressWrong.style.left    = correctW + '%';
  progressWrong.style.width   = wrongW + '%';
}
