// utils/gradeUtils.js — all computation runs on YOUR server, not Firebase

function letterGrade(pct) {
  if (pct >= 93) return { letter: 'A',  color: '#38a169', bg: '#f0fff4' };
  if (pct >= 90) return { letter: 'A-', color: '#38a169', bg: '#f0fff4' };
  if (pct >= 87) return { letter: 'B+', color: '#4299e1', bg: '#ebf8ff' };
  if (pct >= 83) return { letter: 'B',  color: '#4299e1', bg: '#ebf8ff' };
  if (pct >= 80) return { letter: 'B-', color: '#4299e1', bg: '#ebf8ff' };
  if (pct >= 77) return { letter: 'C+', color: '#e8a040', bg: '#fff8ee' };
  if (pct >= 73) return { letter: 'C',  color: '#e8a040', bg: '#fff8ee' };
  if (pct >= 70) return { letter: 'C-', color: '#e8a040', bg: '#fff8ee' };
  return           { letter: 'D/F', color: '#e53e3e', bg: '#fff5f5' };
}

function aiLabel(score) {
  if (score === null || score === undefined) return null;
  if (score >= 70) return { label: 'Likely AI-generated', color: '#e53e3e', bg: '#fff5f5', icon: '🤖' };
  if (score >= 40) return { label: 'Mixed signals',       color: '#e8a040', bg: '#fff8ee', icon: '⚠️' };
  return                   { label: 'Likely human-written', color: '#38a169', bg: '#f0fff4', icon: '✅' };
}

// Map signal key → human-readable explanation
const SIGNAL_EXPLANATIONS = {
  // AI signals
  __HAS_JSDOC__:               'Uses JSDoc comments — common in AI-generated code',
  __COMPLEXITY_ANALYSIS__:     'Contains Big-O / complexity analysis comments',
  __BIG_O_NOTATION__:          'References Big-O notation explicitly',
  __TIME_COMPLEXITY_COMMENT__: 'Has time complexity comment',
  __SPACE_COMPLEXITY_COMMENT__:'Has space complexity comment',
  __ALGORITHM_NAMED__:         'Names a specific algorithm (e.g. "binary search", "BFS")',
  __LOGS_REMOVED__:            'No debug/console logs — AI tends to omit these',
  __PERFECT_FORMATTING__:      'Perfectly consistent indentation and formatting',
  __GENERIC_VAR_NAMES__:       'Uses generic variable names (result, temp, current)',
  __EXCESSIVE_COMMENTS__:      'Unusually high comment density',
  __CAMEL_CASE_CONSISTENT__:   'Perfectly consistent camelCase naming',
  __NO_TYPOS_IN_COMMENTS__:    'No typos or informal language in comments',
  __HELPER_FUNCTIONS__:        'Code is broken into many small helper functions',
  __HANDLES_EDGE_CASES__:      'Explicitly handles edge cases (null, empty, undefined)',
  __SORTED_IMPORTS__:          'Imports are sorted alphabetically',
  __USES_CONST_LET__:          'Exclusively uses const/let — no var',
  __ARROW_FUNCTIONS__:         'Heavy use of arrow functions',
  __FUNCTIONAL_STYLE__:        'Functional programming style (map/filter/reduce)',
  __TEMPLATE_LITERALS__:       'Uses template literals throughout',
  __OPTIONAL_CHAINING__:       'Uses optional chaining (?.) extensively',
  __NULLISH_COALESCING__:      'Uses nullish coalescing (??)',
  __ASYNC_AWAIT_PATTERN__:     'Consistent async/await with try/catch pattern',
  // Human signals
  __HAS_CONSOLE_LOG__:         'Has console.log debug statements — typical of humans',
  __CASUAL_COMMENT__:          'Contains casual or informal comments',
  __ALERT_DEBUGGER__:          'Uses alert() or debugger — debugging artifacts',
  __USES_VAR__:                'Uses var — older/less careful coding style',
  __COMMENTED_OUT_CODE__:      'Has commented-out code blocks',
  __WITH_STATEMENT__:          'Uses with() statement — uncommon in AI code',
  __EVAL_USAGE__:              'Uses eval() — rare in generated code',
  __DOCUMENT_WRITE__:          'Uses document.write() — older web pattern',
  __INCONSISTENT_SPACING__:    'Inconsistent spacing patterns',
  __SHORT_VAR_NAMES__:         'Uses short/abbreviated variable names (i, j, tmp)',
  __TYPO_IN_COMMENT__:         'Contains typos or informal language in comments',
};

function explainSignals(signals = []) {
  return signals.map(sig => ({
    signal: sig,
    explanation: SIGNAL_EXPLANATIONS[sig] || sig.replace(/__/g, '').replace(/_/g, ' ').toLowerCase(),
  }));
}

function computeStudentGrade(assignments, studentId) {
  let earned = 0, total = 0, gradedCount = 0;
  const breakdown = [];

  for (const a of assignments) {
    const sub = (a.submissions || []).find(s =>
      s.student === studentId || s.student?._id === studentId
    );
    const maxPts = a.points || 100;
    total += maxPts;

    if (sub && sub.score !== null && sub.score !== undefined) {
      earned += sub.score;
      gradedCount++;
    }
    breakdown.push({
      assignmentId: a.id,
      title: a.title,
      score: sub?.score ?? null,
      maxPoints: maxPts,
      pct: sub?.score != null ? Math.round((sub.score / maxPts) * 100) : null,
      submitted: !!sub,
      aiScore: sub?.aiScore ?? null,
      dueDate: a.dueDate,
    });
  }

  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
  return { earned, total, pct, letter: gradedCount > 0 ? letterGrade(pct) : null, gradedCount, totalCount: assignments.length, breakdown };
}

function computeClassStats(assignments, studentIds) {
  let totalSubmissions = 0, flaggedCount = 0;
  const aiScores = [], subRates = [];

  for (const a of assignments) {
    const subs = a.submissions || [];
    subRates.push(studentIds.length > 0 ? Math.round((subs.length / studentIds.length) * 100) : 0);
    for (const s of subs) {
      totalSubmissions++;
      if (s.aiScore != null) {
        aiScores.push(s.aiScore);
        if (s.aiScore >= 70) flaggedCount++;
      }
    }
  }

  return {
    totalAssignments: assignments.length,
    totalStudents: studentIds.length,
    totalSubmissions,
    avgSubmissionRate: subRates.length ? Math.round(subRates.reduce((a,b)=>a+b,0)/subRates.length) : 0,
    avgAiScore: aiScores.length ? Math.round(aiScores.reduce((a,b)=>a+b,0)/aiScores.length) : null,
    flaggedSubmissions: flaggedCount,
    flaggedPct: totalSubmissions > 0 ? Math.round((flaggedCount/totalSubmissions)*100) : 0,
  };
}

function getUpcomingDeadlines(assignments) {
  const now = new Date(), cutoff = new Date(now.getTime() + 7*24*60*60*1000);
  return assignments
    .filter(a => a.dueDate && new Date(a.dueDate) >= now && new Date(a.dueDate) <= cutoff)
    .sort((a,b) => new Date(a.dueDate)-new Date(b.dueDate));
}

module.exports = { letterGrade, aiLabel, explainSignals, computeStudentGrade, computeClassStats, getUpcomingDeadlines };
