const state = {
  guesses: [],
  solutions: [],
  remaining: [],
  currentWord: 'tarse',
  currentPattern: [null, null, null, null, null],
  turn: 1,
  entropy: null,
  calculating: false,
  solved: false,
};

const worker = new Worker('./solver-worker.js', { type: 'module' });
const elements = {
  status: document.querySelector('#dictionary-status'),
  word: document.querySelector('#suggested-word'),
  source: document.querySelector('#guess-source'),
  tiles: document.querySelector('#feedback-tiles'),
  submit: document.querySelector('#submit-button'),
  solved: document.querySelector('#solved-button'),
  count: document.querySelector('#candidate-count'),
  entropy: document.querySelector('#entropy-value'),
  list: document.querySelector('#candidate-list'),
  range: document.querySelector('#candidate-range'),
  attempt: document.querySelector('#attempt-number'),
  reset: document.querySelector('#reset-button'),
  toast: document.querySelector('#toast'),
  engine: document.querySelector('#engine-status'),
};

const readWords = async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo leer ${path}`);
  const text = await response.text();
  return text.split(/\r?\n/).map((word) => word.trim().toLowerCase()).filter((word) => word.length === 5);
};

const showToast = (message) => {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove('show'), 2600);
};

const renderTiles = () => {
  elements.tiles.innerHTML = '';
  [...state.currentWord].forEach((letter, index) => {
    const tile = document.createElement('button');
    const value = state.currentPattern[index];
    tile.className = `tile ${value === null ? '' : `state-${value}`}`;
    tile.type = 'button';
    tile.disabled = state.solved;
    tile.textContent = letter.toUpperCase();
    tile.setAttribute('aria-label', `Letra ${letter}, ${value === null ? 'sin marcar' : ['gris', 'amarillo', 'verde'][value]}`);
    tile.addEventListener('click', () => {
      if (state.solved) return;
      state.currentPattern[index] = value === null ? 0 : value === 2 ? null : value + 1;
      renderTiles();
      elements.submit.disabled = state.currentPattern.some((entry) => entry === null);
    });
    elements.tiles.append(tile);
  });
};

const renderCandidates = () => {
  elements.count.textContent = state.remaining.length.toLocaleString('es-ES');
  elements.range.textContent = state.remaining.length ? `1–${Math.min(9, state.remaining.length)}` : 'ninguna';
  elements.list.innerHTML = '';
  state.remaining.slice(0, 9).forEach((word) => {
    const item = document.createElement('div');
    item.className = 'candidate-word';
    item.textContent = word.toUpperCase();
    elements.list.append(item);
  });
  if (!state.remaining.length) {
    const empty = document.createElement('div');
    empty.className = 'loading-state';
    empty.textContent = 'No quedan soluciones con este patrón.';
    elements.list.append(empty);
  }
};

const evaluatePattern = (guess, solution) => {
  const result = [0, 0, 0, 0, 0];
  const remaining = Object.create(null);
  for (let index = 0; index < 5; index += 1) {
    if (guess[index] === solution[index]) result[index] = 2;
    else remaining[solution[index]] = (remaining[solution[index]] || 0) + 1;
  }
  for (let index = 0; index < 5; index += 1) {
    if (result[index] === 2) continue;
    const letter = guess[index];
    if (remaining[letter] > 0) { result[index] = 1; remaining[letter] -= 1; }
  }
  return result;
};

const setSuggestion = (word, entropy = null, source = 'Recomendación por entropía') => {
  state.currentWord = word;
  state.entropy = entropy;
  state.currentPattern = [0, 0, 0, 0, 0];
  elements.word.textContent = word ? word.toUpperCase() : '—';
  elements.source.textContent = source;
  elements.entropy.textContent = entropy === null ? '—' : entropy.toFixed(2);
  elements.submit.disabled = state.solved;
  renderTiles();
};

const calculateNextGuess = () => {
  if (state.turn >= 6 || !state.remaining.length) return;
  state.calculating = true;
  elements.source.textContent = 'Calculando mejor opción...';
  elements.word.textContent = '...';
  elements.submit.disabled = true;
  worker.postMessage({ type: 'best-guess' });
};

const applyResult = () => {
  if (state.solved) return;
  if (state.currentPattern.some((entry) => entry === null)) return;
  const pattern = state.currentPattern.join('');
  state.turn += 1;
  elements.attempt.innerHTML = `${Math.min(state.turn, 6)} <small>/ 6</small>`;
  if (pattern === '22222') {
    markSolved();
    return;
  }
  const encodedPattern = [...pattern].reduce((value, color, index) => value + Number(color) * (3 ** index), 0);
  worker.postMessage({ type: 'filter', word: state.currentWord, pattern: encodedPattern });
};

const reset = () => {
  state.solved = false;
  state.remaining = [...state.solutions];
  state.currentWord = 'tarse';
  state.currentPattern = [0, 0, 0, 0, 0];
  state.turn = 1;
  state.entropy = null;
  worker.postMessage({ type: 'init', guesses: state.guesses, solutions: state.solutions });
  elements.attempt.innerHTML = '1 <small>/ 6</small>';
  elements.entropy.textContent = '—';
  elements.source.textContent = 'Recomendación inicial';
  renderCandidates();
  renderTiles();
  elements.submit.disabled = false;
  elements.solved.disabled = false;
};

const markSolved = () => {
  state.solved = true;
  state.currentPattern = [2, 2, 2, 2, 2];
  elements.source.textContent = 'Resuelto';
  elements.submit.disabled = true;
  elements.solved.disabled = true;
  renderTiles();
  showToast('Partida resuelta.');
};

document.querySelectorAll('.legend-item').forEach((button) => {
  button.addEventListener('click', () => {
    if (state.solved) return;
    const requestedState = Number(button.dataset.state);
    const index = state.currentPattern.findIndex((value) => value === null || value !== requestedState);
    if (index < 0) return;
    state.currentPattern[index] = requestedState;
    renderTiles();
    elements.submit.disabled = state.currentPattern.some((entry) => entry === null);
  });
});

elements.submit.addEventListener('click', applyResult);
elements.solved.addEventListener('click', markSolved);
elements.reset.addEventListener('click', reset);
worker.addEventListener('message', ({ data }) => {
  if (data.type === 'ready') {
    elements.engine.textContent = data.engine;
    return;
  }
  if (data.type === 'filtered') {
    state.remaining = data.solutions;
    elements.engine.textContent = data.engine;
    renderCandidates();
    if (!state.remaining.length) {
      setSuggestion('', null, 'Sin coincidencias');
      showToast('No hay soluciones para ese resultado.');
      return;
    }
    if (state.turn > 6) { showToast('Fin de la partida.'); return; }
    calculateNextGuess();
    return;
  }
  if (data.type === 'result') {
    state.calculating = false;
    elements.engine.textContent = data.engine;
    setSuggestion(data.word, data.entropy, 'Motor C++');
    if (!data.word) showToast('No quedan soluciones.');
  }
});

const boot = async () => {
  try {
    const [guesses, solutions] = await Promise.all([
      readWords('./data/valid-wordle-words.txt'),
      readWords('./data/wordle-answers-alphabetical.txt'),
    ]);
    state.guesses = guesses;
    state.solutions = solutions;
    state.remaining = [...solutions];
    worker.postMessage({ type: 'init', guesses, solutions });
    elements.status.textContent = `${guesses.length.toLocaleString('es-ES')} palabras listas`;
    renderCandidates();
    renderTiles();
    elements.submit.disabled = false;
  } catch (error) {
    elements.status.textContent = 'No se pudieron cargar los datos';
    elements.list.innerHTML = '<div class="loading-state">Abre la web desde un servidor local para cargar los diccionarios.</div>';
    showToast('No se pudieron cargar los diccionarios.');
  }
};

boot();
