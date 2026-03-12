// naiveBayes.js
// Multinomial Naive Bayes classifier for AI vs human code detection
// Massive signal set — humans do a lot of things AI never does and vice versa

class NaiveBayesClassifier {
    constructor() {
      this.logPriors = {};
      this.logLikelihoods = {};
      this.vocab = new Set();
      this.classes = [0, 1];
      this.trained = false;
  
      // If weighted AI score hits this threshold → 100% certain AI
      this.AI_CERTAIN_THRESHOLD = 12.0;
    }
  
    getSignalWeight(token) {
      const weights = {
  
        // ══════════════════════════════════════════════════════════════════════
        // STRONG AI SIGNALS (things AI almost always does, humans almost never)
        // ══════════════════════════════════════════════════════════════════════
  
        '__HAS_JSDOC__':                    3.0,  // /** ... */ blocks
        '__JSDOC_PARAMS__':                 3.0,  // @param @returns @throws @example
        '__BIG_O_NOTATION__':               4.0,  // O(n), O(log n), O(n²)
        '__TIME_COMPLEXITY_COMMENT__':      4.0,  // // Time complexity: O(n)
        '__SPACE_COMPLEXITY_COMMENT__':     4.0,  // // Space complexity: O(1)
        '__COMPLEXITY_ANALYSIS__':          5.0,  // has BOTH time and space complexity
        '__EDGE_CASE_MENTION__':            3.0,  // "edge case" anywhere in comments
        '__STEP_COMMENTS__':                2.5,  // // Step 1:, // Initialize, // Handle
        '__APPROACH_COMMENT__':             3.0,  // // Approach:, // Algorithm:, // Strategy:
        '__PROTOTYPE_CALL__':               3.0,  // Object.prototype.hasOwnProperty.call
        '__NUMBER_GUARDS__':                2.5,  // Number.isInteger, Number.isNaN
        '__THROWS_TYPED_ERRORS__':          2.5,  // throw new TypeError / RangeError (typed)
        '__EARLY_RETURN_GUARD__':           2.0,  // if (!x || x === null) return null
        '__RESULT_VAR_PATTERN__':           2.5,  // const result = ...; return result
        '__DESCRIPTIVE_PARAM_NAMES__':      2.0,  // callback, comparator, accumulator, predicate
        '__ARRAY_METHOD_CHAIN__':           2.0,  // .filter().map().reduce() chains
        '__DEFAULT_PARAMS__':               2.0,  // function foo(x = 0, y = [])
        '__OPTIONAL_CHAINING__':            1.5,  // obj?.prop?.value
        '__NULLISH_COALESCING__':           2.0,  // x ?? defaultValue
        '__CONST_EVERYWHERE__':             1.5,  // const for everything, never var
        '__EXPLICIT_TYPE_CHECK__':          2.0,  // typeof x === 'string', instanceof Array
        '__OBJECT_DESTRUCTURE__':           1.5,  // const { a, b } = obj
        '__ARRAY_DESTRUCTURE__':            1.5,  // const [first, ...rest] = arr
        '__LOTS_OF_BLANK_LINES__':          1.5,  // AI loves visual spacing
        '__VERY_HEAVY_COMMENTS__':          2.0,  // >50% of lines are comments
        '__HEAVY_COMMENTS__':               1.0,  // >30% of lines are comments
        '__VERY_LONG_VAR_NAMES__':          2.0,  // avg identifier length > 12
        '__LONG_VAR_NAMES__':               1.0,  // avg identifier length > 8
        '__HELPER_FUNCTION_DEFINED__':      1.5,  // inner helper function defined inside main fn
        '__IIFE_PATTERN__':                 1.0,  // (() => {})() immediately invoked
        '__TEMPLATE_LITERALS__':            0.8,  // `Hello ${name}` template strings
        '__SPREAD_OPERATOR__':              1.0,  // [...arr], {...obj}
        '__SATISFIES_OPERATOR__':           2.0,  // satisfies keyword (TS/modern)
        '__NAMED_EXPORT__':                 1.0,  // export const / export function
        '__CONSISTENT_SEMICOLONS__':        1.0,  // semicolons on every line
        '__ALGORITHM_NAMED__':              3.0,  // "binary search", "bubble sort", "BFS", "DFS" in comments
        '__TRICKY_EDGE_HANDLING__':         2.5,  // checks for empty string, NaN, Infinity, -0
        '__IMMUTABLE_PATTERN__':            1.5,  // never mutates input, always returns new value
        '__MODULAR_DECOMPOSITION__':        2.0,  // splits into multiple small single-purpose functions
        '__GUARD_CLAUSE_PATTERN__':         2.0,  // multiple early returns at top of function
        '__WELL_NAMED_BOOLEANS__':          1.5,  // isValid, hasValue, shouldContinue, isEmpty
        '__ENUM_LIKE_CONST__':              1.5,  // const DIRECTIONS = { UP: 'up', DOWN: 'down' }
        '__PURE_FUNCTION_STYLE__':          1.5,  // no side effects, all inputs/outputs explicit
        '__LOGS_REMOVED__':                 2.0,  // zero console statements in longer code
        '__USES_REDUCE__':                  1.5,  // .reduce( — AI loves reduce
        '__USES_MAP_FILTER__':              1.0,  // .map( and .filter( in same file
  
        // ══════════════════════════════════════════════════════════════════════
        // STRONG HUMAN SIGNALS (things humans do a lot, AI almost never does)
        // ══════════════════════════════════════════════════════════════════════
  
        '__HAS_CONSOLE_LOG__':             -3.5,  // console.log('here') debug leftover
        '__USES_VAR__':                    -3.5,  // var x = ... old habit
        '__CASUAL_COMMENT__':              -4.0,  // // lol, // idk, // wtf, // bruh
        '__TODO_COMMENT__':                -3.0,  // // TODO: fix this later
        '__FIXME_COMMENT__':               -3.0,  // // FIXME: broken
        '__NO_SEMICOLONS__':               -1.5,  // missing semicolons consistently
        '__DOUBLE_EQUALS__':               -2.5,  // == instead of ===
        '__TRIPLE_EQUALS_SOMETIMES__':     -1.0,  // mixes == and ===
        '__MIXED_NAMING__':                -2.0,  // camelCase AND snake_case in same file
        '__SHORT_VAR_NAMES__':             -1.5,  // single letter or 2-char vars dominate
        '__MAGIC_NUMBERS__':               -2.0,  // raw numbers like 86400, 1000, 255 unexplained
        '__COMMENTED_OUT_CODE__':          -3.0,  // // var x = 5 or // return foo()
        '__CONSOLE_WARN_ERROR__':          -2.0,  // console.warn / console.error debug style
        '__ALERT_DEBUGGER__':              -4.0,  // alert() or debugger; — classic human debug
        '__EMPTY_CATCH__':                 -2.5,  // catch(e) {} doing nothing
        '__CALLBACK_HELL__':               -2.5,  // 3+ levels of nested callbacks
        '__CHAINED_IF_ELSE__':             -1.5,  // long if / else if / else if chains
        '__TABS_INDENT__':                 -1.0,  // tab indentation (humans often use tabs)
        '__VARIED_LINE_LENGTHS__':         -1.0,  // wildly inconsistent line lengths
        '__REASSIGNS_PARAMETER__':         -2.0,  // function(x) { x = x + 1 — mutates param
        '__INCREMENTS_OUTSIDE_FOR__':      -1.5,  // i++ used outside a for loop
        '__LOOSE_COMPARISON_NULL__':       -2.0,  // x == null or x == undefined
        '__TYPEOF_UNDEFINED__':            -1.5,  // typeof x == 'undefined' old pattern
        '__GLOBAL_VAR_LEAK__':             -2.0,  // variable assigned without var/let/const
        '__COPY_PASTE_REPETITION__':       -2.0,  // same block of code repeated 2+ times
        '__UNUSED_VARIABLE__':             -1.5,  // variable declared but never used pattern
        '__FUNCTION_TOO_LONG__':           -1.5,  // single function > 50 lines
        '__DEEPLY_NESTED__':               -2.0,  // 4+ levels of indentation
        '__NO_COMMENTS__':                 -1.0,  // zero comments on non-trivial code
        '__INCONSISTENT_SPACING__':        -1.5,  // mixed spacing around operators
        '__TRAILING_WHITESPACE__':         -0.5,  // lines ending with spaces
        '__BRACKET_ON_NEW_LINE__':         -0.5,  // Allman style braces { on new line
        '__RANDOM_CAPITALIZATION__':       -1.5,  // variable names with random caps
        '__MISSPELLED_COMMENT__':          -2.0,  // common typos in comments
        '__HARDCODED_STRING__':            -1.5,  // hardcoded URLs, passwords, paths
        '__IMPLICIT_COERCION__':           -1.5,  // +x, !!x, x|0 implicit type coercion
        '__OLD_STRING_CONCAT__':           -1.0,  // "hello " + name + "!" string concat
        '__PROTOTYPE_EXTENSION__':         -2.0,  // Array.prototype.myMethod = function()
        '__FOR_IN_ARRAY__':                -2.0,  // for (var i in arr) — wrong pattern
        '__ARGUMENTS_OBJECT__':            -1.5,  // uses arguments object instead of rest params
        '__WITH_STATEMENT__':              -3.0,  // with(obj) { } — deprecated pattern
        '__EVAL_USAGE__':                  -3.0,  // eval('code') — classic bad practice
        '__DOCUMENT_WRITE__':              -3.0,  // document.write() — old school
        '__INLINE_EVENT_HANDLER__':        -2.0,  // onclick="foo()" style
        '__MULTIPLE_VAR_DECLARATION__':    -1.5,  // var a = 1, b = 2, c = 3 on one line
        '__SEMICOLON_AFTER_BLOCK__':       -1.0,  // }; after function declaration
  
        // ══════════════════════════════════════════════════════════════════════
        // NEUTRAL / WEAK SIGNALS
        // ══════════════════════════════════════════════════════════════════════
  
        '__LIGHT_COMMENTS__':             -0.2,
        '__MODERATE_BLANK_LINES__':        0.0,
        '__NO_BLANK_LINES__':             -0.3,
        '__NAMED_FUNCTIONS__':            -0.2,
        '__ARROW_FUNCTIONS__':             0.3,
        '__CONST_ARROW__':                 0.4,
        '__SPACES_INDENT__':               0.3,
        '__MEDIUM_VAR_NAMES__':            0.0,
        '__MODERATE_LINE_VARIANCE__':      0.0,
        '__VERY_SHORT__':                 -0.5,
        '__SHORT__':                      -0.2,
        '__MEDIUM__':                      0.1,
        '__LONG__':                        0.4,
      };
      return weights[token] ?? 0;
    }
  
    tokenize(code) {
      const tokens = [];
      const lines = code.split('\n');
      const nonEmpty = lines.filter(l => l.trim().length > 0);
      const codeLines = nonEmpty.filter(l => !l.trim().startsWith('//'));
  
      // ── JSDoc / comment signals ────────────────────────────────────────────
      const hasJsdoc = /\/\*\*[\s\S]*?\*\//.test(code);
      const inlineComments = (code.match(/\/\/.+/g) || []).length;
      const commentRatio = inlineComments / Math.max(nonEmpty.length, 1);
  
      if (hasJsdoc) tokens.push('__HAS_JSDOC__');
      if (commentRatio > 0.3) tokens.push('__HEAVY_COMMENTS__');
      if (commentRatio > 0.5) tokens.push('__VERY_HEAVY_COMMENTS__');
      if (commentRatio === 0 && nonEmpty.length > 8) tokens.push('__NO_COMMENTS__');
      if (commentRatio > 0 && commentRatio <= 0.15) tokens.push('__LIGHT_COMMENTS__');
      if (/@param|@returns|@type|@throws|@example/i.test(code)) tokens.push('__JSDOC_PARAMS__');
      if (/\/\/\s*(Approach|Algorithm|Strategy|Solution|Method|Overview|Idea):/i.test(code)) tokens.push('__APPROACH_COMMENT__');
      if (/\/\/\s*(Step\s*\d|Handle|Check|Return|First|Then|Finally|Note:|Initialize|Validate|Iterate)/i.test(code)) tokens.push('__STEP_COMMENTS__');
      if (/\/\/\s*Time complexity/i.test(code)) tokens.push('__TIME_COMPLEXITY_COMMENT__');
      if (/\/\/\s*Space complexity/i.test(code)) tokens.push('__SPACE_COMPLEXITY_COMMENT__');
      if (/\/\/\s*Time complexity/i.test(code) && /\/\/\s*Space complexity/i.test(code)) tokens.push('__COMPLEXITY_ANALYSIS__');
      if (/\bedge\s*case/i.test(code)) tokens.push('__EDGE_CASE_MENTION__');
      if (/\bO\s*\([nN1log²\s]+\)/.test(code)) tokens.push('__BIG_O_NOTATION__');
      if (/(binary\s*search|bubble\s*sort|merge\s*sort|quick\s*sort|BFS|DFS|dynamic\s*programming|memoization)/i.test(code)) tokens.push('__ALGORITHM_NAMED__');
  
      // ── Human comment patterns ─────────────────────────────────────────────
      if (/\/\/\s*(lol|idk|wtf|tbh|bruh|omg|ugh|smh|lmao|haha|ok|okay|yep|nope|hmm|ugh|bleh|meh)/i.test(code)) tokens.push('__CASUAL_COMMENT__');
      if (/\/\/\s*TODO/i.test(code)) tokens.push('__TODO_COMMENT__');
      if (/\/\/\s*FIXME/i.test(code)) tokens.push('__FIXME_COMMENT__');
      if (/\/\/\s*(var |let |const |return |if |for |while |function )/.test(code)) tokens.push('__COMMENTED_OUT_CODE__');
      if (/\/\/\s*\w+\s*\(/.test(code) && /\/\/.*[=;]/.test(code)) tokens.push('__COMMENTED_OUT_CODE__');
  
      // ── Identifier / naming signals ────────────────────────────────────────
      const varNames = code.match(/\b[a-z][a-zA-Z0-9]{2,}\b/g) || [];
      const avgVarLen = varNames.length > 0
        ? varNames.reduce((s, v) => s + v.length, 0) / varNames.length : 0;
      if (avgVarLen > 8)  tokens.push('__LONG_VAR_NAMES__');
      if (avgVarLen > 12) tokens.push('__VERY_LONG_VAR_NAMES__');
      if (avgVarLen < 4)  tokens.push('__SHORT_VAR_NAMES__');
      if (avgVarLen >= 4 && avgVarLen <= 8) tokens.push('__MEDIUM_VAR_NAMES__');
  
      if (/\b(callback|comparator|accumulator|initialValue|predicate|transform|reducer|iterator|validator|formatter)\b/.test(code)) tokens.push('__DESCRIPTIVE_PARAM_NAMES__');
      if (/\b(isValid|hasValue|shouldContinue|isEmpty|isNullOrUndefined|isArray|hasKey|canProceed)\b/.test(code)) tokens.push('__WELL_NAMED_BOOLEANS__');
      if (/[a-z][A-Z][a-z]/.test(code) && /[_][a-z]/.test(code)) tokens.push('__MIXED_NAMING__');
      // Random caps in var names (not camelCase) like myVAR or TESTvalue
      if (/\b[a-z]+[A-Z]{2,}[a-z]*\b/.test(code)) tokens.push('__RANDOM_CAPITALIZATION__');
  
      // ── Line structure signals ─────────────────────────────────────────────
      const lineLengths = nonEmpty.map(l => l.length);
      const avgLen = lineLengths.reduce((a, b) => a + b, 0) / Math.max(lineLengths.length, 1);
      const variance = lineLengths.reduce((s, l) => s + Math.pow(l - avgLen, 2), 0) / Math.max(lineLengths.length, 1);
      const stdDev = Math.sqrt(variance);
      if (stdDev > 30) tokens.push('__VARIED_LINE_LENGTHS__');
      if (stdDev >= 15 && stdDev <= 30) tokens.push('__MODERATE_LINE_VARIANCE__');
  
      // Deeply nested — 4+ levels of indentation
      if (nonEmpty.some(l => l.match(/^(\s{16,}|\t{4,})/))) tokens.push('__DEEPLY_NESTED__');
  
      // Trailing whitespace
      if (lines.some(l => l.match(/\s+$/))) tokens.push('__TRAILING_WHITESPACE__');
  
      // Allman style braces
      if ((code.match(/\n\s*\{/g) || []).length > 2) tokens.push('__BRACKET_ON_NEW_LINE__');
  
      // Function too long
      const funcMatch = code.match(/function[\s\S]*?\{([\s\S]*?)\}/g);
      if (funcMatch && funcMatch.some(f => f.split('\n').length > 50)) tokens.push('__FUNCTION_TOO_LONG__');
  
      // ── Blank line patterns ────────────────────────────────────────────────
      const blankRatio = lines.filter(l => l.trim() === '').length / Math.max(lines.length, 1);
      if (blankRatio > 0.2) tokens.push('__LOTS_OF_BLANK_LINES__');
      if (blankRatio < 0.05) tokens.push('__NO_BLANK_LINES__');
      if (blankRatio >= 0.05 && blankRatio <= 0.2) tokens.push('__MODERATE_BLANK_LINES__');
  
      // ── AI code style signals ──────────────────────────────────────────────
      if (/Object\.prototype\.hasOwnProperty\.call/.test(code)) tokens.push('__PROTOTYPE_CALL__');
      if (/Number\.isInteger|Number\.isNaN|Number\.isFinite/.test(code)) tokens.push('__NUMBER_GUARDS__');
      if (/throw new TypeError|throw new RangeError/.test(code)) tokens.push('__THROWS_TYPED_ERRORS__');
      if (/if\s*\(\s*(![\w.]+|[\w.]+\s*===\s*(null|undefined)|[\w.]+\.length\s*===\s*0)/.test(code)) tokens.push('__EARLY_RETURN_GUARD__');
      if (/const\s+result\s*=|let\s+result\s*=/.test(code)) tokens.push('__RESULT_VAR_PATTERN__');
      if (/\.(filter|map|reduce|forEach|find|some|every)\s*\(.*\)\s*\.(filter|map|reduce|find|some|every)/.test(code)) tokens.push('__ARRAY_METHOD_CHAIN__');
      if (/\.reduce\s*\(/.test(code)) tokens.push('__USES_REDUCE__');
      if (/\.map\s*\(/.test(code) && /\.filter\s*\(/.test(code)) tokens.push('__USES_MAP_FILTER__');
      if (/function\s+\w+\s*\([^)]*=/.test(code)) tokens.push('__DEFAULT_PARAMS__');
      if (/\?\.\w/.test(code)) tokens.push('__OPTIONAL_CHAINING__');
      if (/\?\?/.test(code)) tokens.push('__NULLISH_COALESCING__');
      if (/\.\.\.\w/.test(code)) tokens.push('__SPREAD_OPERATOR__');
      if (/`[^`]*\$\{/.test(code)) tokens.push('__TEMPLATE_LITERALS__');
      if (!/\bvar\b/.test(code) && (code.match(/\bconst\b/g) || []).length > (code.match(/\blet\b/g) || []).length * 2) tokens.push('__CONST_EVERYWHERE__');
      if (/typeof\s+\w+\s*===|instanceof\s+\w+/.test(code)) tokens.push('__EXPLICIT_TYPE_CHECK__');
      if (/const\s*\{[^}]+\}\s*=|let\s*\{[^}]+\}\s*=/.test(code)) tokens.push('__OBJECT_DESTRUCTURE__');
      if (/const\s*\[[^\]]+\]\s*=|let\s*\[[^\]]+\]\s*=/.test(code)) tokens.push('__ARRAY_DESTRUCTURE__');
      if (/\(\s*(?:function|\([^)]*\)\s*=>)\s*\{[\s\S]*?\}\s*\)\s*\(/.test(code)) tokens.push('__IIFE_PATTERN__');
      if (/export\s+(const|function|class|default)/.test(code)) tokens.push('__NAMED_EXPORT__');
      if (/const\s+[A-Z_]+\s*=\s*\{/.test(code) || /const\s+[A-Z_]+\s*=\s*Object\.freeze/.test(code)) tokens.push('__ENUM_LIKE_CONST__');
      // Multiple early returns (guard clause pattern)
      const returnMatches = (code.match(/^\s*return\s+/mg) || []).length;
      if (returnMatches >= 3) tokens.push('__GUARD_CLAUSE_PATTERN__');
      // Logs removed — longer code (>20 lines) with zero console
      if (nonEmpty.length > 20 && !/console\./.test(code)) tokens.push('__LOGS_REMOVED__');
      // Check for NaN, Infinity, -0 handling
      if (/Number\.isNaN|=== Infinity|=== -0|Object\.is\(/.test(code)) tokens.push('__TRICKY_EDGE_HANDLING__');
  
      // ── Human code style signals ───────────────────────────────────────────
      if (/console\.log/.test(code)) tokens.push('__HAS_CONSOLE_LOG__');
      if (/console\.warn|console\.error/.test(code)) tokens.push('__CONSOLE_WARN_ERROR__');
      if (/\bvar\s+/.test(code)) tokens.push('__USES_VAR__');
      if (/alert\s*\(|debugger\s*;/.test(code)) tokens.push('__ALERT_DEBUGGER__');
      if (/[^=!<>]==[^=]/.test(code)) tokens.push('__DOUBLE_EQUALS__');
      // Mixes == and ===
      if (/[^=!<>]==[^=]/.test(code) && /===[^=]/.test(code)) tokens.push('__TRIPLE_EQUALS_SOMETIMES__');
      // Magic numbers > 9 not in array indices or common constants
      if (/\b(10|24|60|100|255|1000|86400|9999|365)\b/.test(code)) tokens.push('__MAGIC_NUMBERS__');
      if ((/[^.]\b([2-9][0-9]|[1-9][0-9]{2,})\b/.test(code)) && !/O\(/.test(code)) tokens.push('__MAGIC_NUMBERS__');
      if (catch_empty(code)) tokens.push('__EMPTY_CATCH__');
      if ((code.match(/function\s*\([^)]*\)\s*\{/g) || []).length >= 3 && (code.match(/\n\s{12,}/g) || []).length > 2) tokens.push('__CALLBACK_HELL__');
      if ((code.match(/else\s+if/g) || []).length >= 3) tokens.push('__CHAINED_IF_ELSE__');
      // Reassigning a parameter
      if (/function\s+\w+\s*\((\w+)[\s,)][^{]*\)\s*\{[^}]*\1\s*=/.test(code)) tokens.push('__REASSIGNS_PARAMETER__');
      // i++ outside for loop
      if (/(?<!for\s*\([^)]*)\w\+\+(?!\s*[;)])/.test(code) && !/for\s*\(/.test(code)) tokens.push('__INCREMENTS_OUTSIDE_FOR__');
      // x == null or x == undefined
      if (/\w+\s*==\s*(null|undefined)/.test(code)) tokens.push('__LOOSE_COMPARISON_NULL__');
      // typeof x == 'undefined'
      if (/typeof\s+\w+\s*==\s*['"]undefined['"]/.test(code)) tokens.push('__TYPEOF_UNDEFINED__');
      // Variable without declaration keyword (global leak)
      if (/^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*=[^=]/.test(code) && !/^\s*(var|let|const|function|class)/.test(code)) tokens.push('__GLOBAL_VAR_LEAK__');
      // Implicit type coercion
      if (/[^+]\+\w+\b(?!\s*[=+])|\b\w+\s*\|\s*0\b|!!\w+/.test(code)) tokens.push('__IMPLICIT_COERCION__');
      // Old string concatenation
      if (/"[^"]*"\s*\+\s*\w|'\w[^']*'\s*\+\s*\w/.test(code)) tokens.push('__OLD_STRING_CONCAT__');
      // Array.prototype extension
      if (/Array\.prototype\.\w+\s*=\s*function|Object\.prototype\.\w+\s*=\s*function/.test(code)) tokens.push('__PROTOTYPE_EXTENSION__');
      // for...in on array
      if (/for\s*\(\s*(var|let|const)?\s*\w+\s+in\s+\w*(arr|array|list|items)\w*/.test(code)) tokens.push('__FOR_IN_ARRAY__');
      // arguments object
      if (/\barguments\b/.test(code)) tokens.push('__ARGUMENTS_OBJECT__');
      // with statement
      if (/\bwith\s*\(/.test(code)) tokens.push('__WITH_STATEMENT__');
      // eval
      if (/\beval\s*\(/.test(code)) tokens.push('__EVAL_USAGE__');
      // document.write
      if (/document\.write\s*\(/.test(code)) tokens.push('__DOCUMENT_WRITE__');
      // multiple var on one line
      if (/\bvar\s+\w+\s*=\s*[^,\n]+,\s*\w+\s*=/.test(code)) tokens.push('__MULTIPLE_VAR_DECLARATION__');
      // Copy-paste repetition: same line appears 3+ times
      const lineFreq = {};
      for (const l of codeLines) {
        const trimmed = l.trim();
        if (trimmed.length > 10) lineFreq[trimmed] = (lineFreq[trimmed] || 0) + 1;
      }
      if (Object.values(lineFreq).some(v => v >= 3)) tokens.push('__COPY_PASTE_REPETITION__');
      // Inconsistent spacing around operators
      if (/\w=[^\s=]|\w\+[^\s+]|\w-[^\s\-]/.test(code)) tokens.push('__INCONSISTENT_SPACING__');
  
      // ── Semicolon consistency ──────────────────────────────────────────────
      const statementsWithSemi = (code.match(/;\s*$/mg) || []).length;
      const statementsTotal = codeLines.length;
      const semiRatio = statementsWithSemi / Math.max(statementsTotal, 1);
      if (semiRatio > 0.8) tokens.push('__CONSISTENT_SEMICOLONS__');
      if (semiRatio < 0.3) tokens.push('__NO_SEMICOLONS__');
  
      // ── Function style ─────────────────────────────────────────────────────
      if (/=>\s*[\{\(]/.test(code) || /=>\s*\w/.test(code)) tokens.push('__ARROW_FUNCTIONS__');
      if (/function\s+\w+\s*\(/.test(code)) tokens.push('__NAMED_FUNCTIONS__');
      if (/const\s+\w+\s*=\s*\(/.test(code)) tokens.push('__CONST_ARROW__');
  
      // ── Indentation ────────────────────────────────────────────────────────
      const usesTabs = nonEmpty.some(l => l.startsWith('\t'));
      const usesSpaces = nonEmpty.some(l => l.startsWith('  '));
      if (usesTabs) tokens.push('__TABS_INDENT__');
      if (usesSpaces) tokens.push('__SPACES_INDENT__');
  
      // ── Code length ────────────────────────────────────────────────────────
      const loc = nonEmpty.length;
      if (loc < 10) tokens.push('__VERY_SHORT__');
      if (loc >= 10 && loc < 25) tokens.push('__SHORT__');
      if (loc >= 25 && loc < 50) tokens.push('__MEDIUM__');
      if (loc >= 50) tokens.push('__LONG__');
  
      return tokens;
    }
  
    train(samples) {
      const classCounts = { 0: 0, 1: 0 };
      const tokenCounts = { 0: {}, 1: {} };
      const totalTokens = { 0: 0, 1: 0 };
  
      for (const sample of samples) {
        const label = sample.label;
        classCounts[label]++;
        const tokens = this.tokenize(sample.code);
  
        for (const token of tokens) {
          if (!token.startsWith('__')) continue;
          this.vocab.add(token);
          tokenCounts[label][token] = (tokenCounts[label][token] || 0) + 1;
          totalTokens[label]++;
        }
      }
  
      const total = samples.length;
      const vocabSize = this.vocab.size;
  
      // Balanced priors
      for (const c of this.classes) {
        this.logPriors[c] = Math.log(0.5);
      }
  
      // Log likelihoods with Laplace smoothing
      this.logLikelihoods = { 0: {}, 1: {} };
      for (const c of this.classes) {
        for (const token of this.vocab) {
          const count = tokenCounts[c][token] || 0;
          this.logLikelihoods[c][token] = Math.log((count + 1) / (totalTokens[c] + vocabSize));
        }
      }
  
      this.trained = true;
      console.log(`Naive Bayes trained on ${total} samples, vocab size: ${vocabSize}`);
    }
  
    predict(code) {
      if (!this.trained) throw new Error('Model not trained yet');
  
      const tokens = this.tokenize(code);
  
      // Separate AI and human signal weights
      let aiWeight = 0;
      let humanWeight = 0;
  
      for (const token of tokens) {
        if (!token.startsWith('__')) continue;
        const w = this.getSignalWeight(token);
        if (w > 0) aiWeight += w;
        if (w < 0) humanWeight += Math.abs(w);
      }
  
      const totalWeight = aiWeight + humanWeight;
  
      // ── Rule 1: No AI signals at all → score 0 ────────────────────────────
      if (aiWeight === 0) {
        return { probAI: 0, probHuman: 1, scores: {} };
      }
  
      // ── Rule 2: AI weight passes certainty threshold → score 100 ──────────
      // Only if AI signals significantly outweigh human signals
      if (aiWeight >= this.AI_CERTAIN_THRESHOLD && aiWeight > humanWeight * 2) {
        return { probAI: 1, probHuman: 0, scores: {} };
      }
  
      // ── NB secondary signal ────────────────────────────────────────────────
      const scores = {};
      for (const c of this.classes) {
        scores[c] = this.logPriors[c];
        for (const token of tokens) {
          if (token.startsWith('__') && this.vocab.has(token)) {
            scores[c] += this.logLikelihoods[c][token];
          }
        }
      }
      const nbDiff = scores[1] - scores[0];
      const nbProb = 1 / (1 + Math.exp(-nbDiff * 0.03));
  
      // ── Weighted blend ─────────────────────────────────────────────────────
      const netScore = aiWeight - humanWeight;
      const manualProb = 1 / (1 + Math.exp(-netScore * 0.3));
      let rawProb = (manualProb * 0.65) + (nbProb * 0.35);
  
      // ── Human bias: pull down if human signals exist and AI doesn't dominate
      if (humanWeight > 0 && aiWeight <= humanWeight * 1.5) {
        rawProb *= 0.70;
      }
  
      rawProb = Math.max(0.01, Math.min(0.99, rawProb));
  
      return { probAI: rawProb, probHuman: 1 - rawProb, scores };
    }
  
    save(filepath) {
      const data = {
        logPriors: this.logPriors,
        logLikelihoods: this.logLikelihoods,
        vocab: [...this.vocab],
        trained: this.trained,
      };
      require('fs').writeFileSync(filepath, JSON.stringify(data));
    }
  
    load(filepath) {
      const data = JSON.parse(require('fs').readFileSync(filepath, 'utf-8'));
      this.logPriors = data.logPriors;
      this.logLikelihoods = data.logLikelihoods;
      this.vocab = new Set(data.vocab);
      this.trained = data.trained;
    }
  }
  
  // Helper detects empty catch blocks
  function catch_empty(code) {
    return /catch\s*\([^)]*\)\s*\{\s*\}/.test(code);
  }
  
  module.exports = NaiveBayesClassifier;