let engine = null;
let guesses = [];
let solutions = [];
let readyPromise = Promise.resolve();

const evaluatePattern = (guess, solution) => {
  const colors = [0, 0, 0, 0, 0];
  const remaining = Object.create(null);
  for (let position = 0; position < 5; position += 1) {
    if (guess[position] === solution[position]) colors[position] = 2;
    else remaining[solution[position]] = (remaining[solution[position]] || 0) + 1;
  }
  for (let position = 0; position < 5; position += 1) {
    if (colors[position] === 2) continue;
    const letter = guess[position];
    if (remaining[letter] > 0) { colors[position] = 1; remaining[letter] -= 1; }
  }
  return colors;
};

const patterns = (guess, solution) => {
  const colors = evaluatePattern(guess, solution);
  let pattern = 0;
  let power = 1;
  for (const color of colors) { pattern += power * color; power *= 3; }
  return pattern;
};

const fallbackEntropy = (guess, currentSolutions) => {
  const counts = new Int32Array(243);
  for (const solution of currentSolutions) counts[patterns(guess, solution)] += 1;
  let result = 0;
  for (const count of counts) {
    if (count > 0) {
      const probability = count / currentSolutions.length;
      result += probability * Math.log2(1 / probability);
    }
  }
  return result;
};

const fallbackBestGuess = () => {
  if (!solutions.length || !guesses.length) return { word: '', entropy: 0 };
  if (solutions.length === 1) return { word: solutions[0], entropy: 0 };
  let bestWord = guesses[0];
  let bestEntropy = 0;
  for (const guess of guesses) {
    const currentEntropy = fallbackEntropy(guess, solutions);
    if (currentEntropy > bestEntropy) { bestEntropy = currentEntropy; bestWord = guess; }
  }
  return { word: bestWord, entropy: bestEntropy };
};

const loadWasm = async () => {
  try {
    const module = await import('./wasm/solver.js');
    const createModule = module.default;
    const wasm = await createModule();
    const wasmGuesses = new wasm.StringVector();
    const wasmSolutions = new wasm.StringVector();
    guesses.forEach((word) => wasmGuesses.push_back(word));
    solutions.forEach((word) => wasmSolutions.push_back(word));
    engine = new wasm.SolverEngine(wasmGuesses, wasmSolutions);
    wasmGuesses.delete();
    wasmSolutions.delete();
    return true;
  } catch {
    return false;
  }
};

const initialize = async (data) => {
  engine = null;
  guesses = data.guesses;
  solutions = data.solutions;
  self.postMessage({ type: 'ready', engine: await loadWasm() ? 'C++ / WebAssembly' : 'JavaScript' });
};

self.onmessage = async ({ data }) => {
  if (data.type === 'init') { readyPromise = initialize(data); await readyPromise; return; }
  await readyPromise;
  if (data.type === 'filter') {
    if (engine) {
      engine.filter(data.word, data.pattern);
      solutions = engine.current_solutions().slice();
      self.postMessage({ type: 'filtered', solutions, engine: 'C++ / WebAssembly' });
    } else {
      solutions = solutions.filter((solution) => patterns(data.word, solution) === data.pattern);
      self.postMessage({ type: 'filtered', solutions, engine: 'JavaScript' });
    }
    return;
  }
  if (data.type !== 'best-guess') return;
  if (engine) self.postMessage({ type: 'result', word: engine.best_guess(), entropy: null, engine: 'C++ / WebAssembly' });
  else self.postMessage({ type: 'result', ...fallbackBestGuess(), engine: 'JavaScript' });
};
