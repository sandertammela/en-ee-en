\
/* EN↔EE sõnavara treener — vanilla JS, GitHub Pages friendly */
const $ = (id) => document.getElementById(id);

const state = {
  pairs: [],
  order: [],
  idx: 0,
  direction: "en-ee",
  mode: "cards",
  knownSet: new Set(),
  quiz: {
    deck: [],
    qidx: 0,
    score: 0,
    locked: false
  }
};

function keyForProgress(direction){
  return `en-ee-trainer::known::${direction}`;
}

function normalize(s){
  return (s || "").toString().trim();
}

function currentQA(pair){
  if (state.direction === "en-ee") return {q: pair.en, a: pair.ee};
  return {q: pair.ee, a: pair.en};
}

function loadProgress(){
  try{
    const raw = localStorage.getItem(keyForProgress(state.direction));
    if (!raw){ state.knownSet = new Set(); return; }
    const arr = JSON.parse(raw);
    state.knownSet = new Set(Array.isArray(arr) ? arr : []);
  }catch{
    state.knownSet = new Set();
  }
}

function saveProgress(){
  localStorage.setItem(keyForProgress(state.direction), JSON.stringify([...state.knownSet]));
}

function setStatus(msg){ $("status").textContent = msg; }

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildOrder(){
  state.order = state.pairs.map((_, i) => i);
  shuffle(state.order);
  state.idx = 0;
}

function showView(){
  $("cardsView").hidden = state.mode !== "cards";
  $("quizView").hidden = state.mode !== "quiz";
}

function updateCard(){
  if (!state.pairs.length) return;
  const pair = state.pairs[state.order[state.idx]];
  const qa = currentQA(pair);

  $("cardPrompt").textContent = qa.q;
  $("cardAnswer").textContent = qa.a;
  $("cardAnswer").hidden = true;

  $("cardCounter").textContent = `Kaart ${state.idx + 1} / ${state.order.length}`;
  $("knownCounter").textContent = `Tean: ${state.knownSet.size}`;
  setStatus(`Režiim: Flashcards • Suund: ${state.direction.toUpperCase()}`);
}

function nextCard(){
  state.idx = (state.idx + 1) % state.order.length;
  updateCard();
}

function markKnown(isKnown){
  const pair = state.pairs[state.order[state.idx]];
  const qa = currentQA(pair);
  // store by question text for the current direction, so EN→EE and EE→EN can be learned separately
  const key = normalize(qa.q);
  if (!key) return;

  if (isKnown) state.knownSet.add(key);
  else state.knownSet.delete(key);

  saveProgress();
  updateCard();
  nextCard();
}

function buildQuizDeck(){
  const sel = $("quizCount").value;
  const allIdx = state.pairs.map((_, i) => i);
  shuffle(allIdx);

  let count = state.pairs.length;
  if (sel !== "all"){
    const n = parseInt(sel, 10);
    if (!Number.isNaN(n)) count = Math.min(n, state.pairs.length);
  }

  state.quiz.deck = allIdx.slice(0, count);
  state.quiz.qidx = 0;
  state.quiz.score = 0;
  state.quiz.locked = false;

  updateQuiz();
}

function randomDistractors(correctAnswer, k = 3){
  // pick k unique answers (same language as answer), excluding correct
  const pool = state.pairs.map(p => currentQA(p).a).filter(a => normalize(a) && normalize(a) !== normalize(correctAnswer));
  shuffle(pool);
  const out = [];
  for (const a of pool){
    if (out.length >= k) break;
    if (!out.some(x => normalize(x) === normalize(a))) out.push(a);
  }
  return out;
}

function updateQuiz(){
  if (!state.pairs.length) return;

  const total = state.quiz.deck.length;
  const idx = state.quiz.qidx;

  if (idx >= total){
    $("quizPrompt").textContent = "Valmis! 🎉";
    $("quizOptions").innerHTML = "";
    $("quizCounter").textContent = `Quiz: ${total} / ${total}`;
    $("quizScore").textContent = `Tulemus: ${state.quiz.score} / ${total}`;
    $("quizNextBtn").disabled = true;
    return;
  }

  const pair = state.pairs[state.quiz.deck[idx]];
  const qa = currentQA(pair);

  const correct = qa.a;
  const opts = [correct, ...randomDistractors(correct, 3)];
  shuffle(opts);

  $("quizPrompt").textContent = qa.q;
  $("quizCounter").textContent = `Quiz: ${idx + 1} / ${total}`;
  $("quizScore").textContent = `Tulemus: ${state.quiz.score} / ${total}`;

  $("quizOptions").innerHTML = "";
  for (const o of opts){
    const btn = document.createElement("button");
    btn.className = "opt";
    btn.type = "button";
    btn.textContent = o;
    btn.addEventListener("click", () => pickOption(btn, o, correct));
    $("quizOptions").appendChild(btn);
  }

  state.quiz.locked = false;
  $("quizNextBtn").disabled = true;
}

function pickOption(btn, picked, correct){
  if (state.quiz.locked) return;
  state.quiz.locked = true;

  const buttons = [...document.querySelectorAll("#quizOptions .opt")];
  for (const b of buttons){
    const val = b.textContent;
    if (normalize(val) === normalize(correct)) b.classList.add("correct");
    else if (normalize(val) === normalize(picked)) b.classList.add("wrong");
    b.disabled = true;
  }

  if (normalize(picked) === normalize(correct)){
    state.quiz.score += 1;
    $("quizScore").textContent = `Tulemus: ${state.quiz.score} / ${state.quiz.deck.length}`;
  }

  $("quizNextBtn").disabled = false;
}

function quizNext(){
  state.quiz.qidx += 1;
  updateQuiz();
}

async function init(){
  // UI listeners
  $("direction").addEventListener("change", () => {
    state.direction = $("direction").value;
    loadProgress();
    buildOrder();
    if (state.mode === "cards") updateCard();
    else buildQuizDeck();
  });

  $("mode").addEventListener("change", () => {
    state.mode = $("mode").value;
    showView();
    if (state.mode === "cards") updateCard();
    else buildQuizDeck();
  });

  $("shuffleBtn").addEventListener("click", () => {
    buildOrder();
    if (state.mode === "cards") updateCard();
    else buildQuizDeck();
  });

  $("resetProgressBtn").addEventListener("click", () => {
    state.knownSet = new Set();
    saveProgress();
    updateCard();
  });

  $("revealBtn").addEventListener("click", () => {
    $("cardAnswer").hidden = !$("cardAnswer").hidden;
  });

  $("nextBtn").addEventListener("click", nextCard);
  $("knownBtn").addEventListener("click", () => markKnown(true));
  $("unknownBtn").addEventListener("click", () => markKnown(false));

  $("quizNextBtn").addEventListener("click", quizNext);
  $("quizRestartBtn").addEventListener("click", buildQuizDeck);

  $("quizCount").addEventListener("change", () => {
    if (state.mode === "quiz") buildQuizDeck();
  });

  // load vocab
  const resp = await fetch("data/vocab.json");
  const data = await resp.json();
  state.pairs = data.pairs || [];

  state.direction = $("direction").value;
  state.mode = $("mode").value;

  loadProgress();
  buildOrder();
  showView();
  updateCard();
  buildQuizDeck();

  setStatus(`Valmis • Sõnu: ${state.pairs.length}`);
}

init().catch(err => {
  console.error(err);
  setStatus("Viga sõnavara laadimisel. Kontrolli, et 'data/vocab.json' on olemas.");
});
