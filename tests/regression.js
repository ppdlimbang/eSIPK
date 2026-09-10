let assertions = 0;
const assert = (condition, message) => { assertions++; if (!condition) throw new Error(message); };
const storage = new Map();
const localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
const listeners = {};
let hash = '#/dashboard';
const window = {
  location: {
    get hash() { return hash; },
    set hash(value) { hash = '#' + value.replace(/^#/, ''); (listeners.hashchange || []).forEach(callback => callback()); },
    replace(value) { this.hash = value; }
  },
  addEventListener: (name, fn) => { (listeners[name] ||= []).push(fn); },
  removeEventListener: (name, fn) => { listeners[name] = (listeners[name] || []).filter(item => item !== fn); },
  confirm: () => true, scrollTo: () => {}, pageYOffset: 0
};
const document = { getElementById: () => null };
let timers = new Map(), timerId = 0;
const setTimeout = (fn, delay) => { const id = ++timerId; if (!delay) timers.set(id, fn); return id; };
const clearTimeout = id => timers.delete(id);
let cells = [], cursor = 0, dirty = false, pendingEffects = [], model;
const sameDeps = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
const useState = initial => {
  const index = cursor++;
  if (!cells[index]) cells[index] = { value: typeof initial === 'function' ? initial() : initial };
  return [cells[index].value, update => {
    const next = typeof update === 'function' ? update(cells[index].value) : update;
    if (!Object.is(cells[index].value, next)) { cells[index].value = next; dirty = true; }
  }];
};
const useRef = initial => {
  const index = cursor++;
  if (!cells[index]) cells[index] = { current: initial };
  return cells[index];
};
const useMemo = (fn, deps) => {
  const index = cursor++;
  if (!cells[index] || !sameDeps(cells[index].deps, deps)) cells[index] = { value: fn(), deps };
  return cells[index].value;
};
const useEffect = (fn, deps) => {
  const index = cursor++;
  if (!cells[index] || !sameDeps(cells[index].deps, deps)) {
    const previous = cells[index];
    cells[index] = { deps };
    pendingEffects.push(() => { previous?.cleanup?.(); cells[index].cleanup = fn(); });
  }
};
const render = () => {
  let loops = 0;
  do {
    if (++loops > 20) throw new Error('Render loop');
    dirty = false; cursor = 0; model = useDashboard();
    const effects = pendingEffects; pendingEffects = []; effects.forEach(effect => effect());
  } while (dirty);
  return model;
};
const settle = async () => { for (let i = 0; i < 30; i++) { const tasks = [...timers.values()]; timers.clear(); tasks.forEach(fn => fn()); await Promise.resolve(); render(); } };
const event = { preventDefault() {} };
