
/* Lünkharjutus — GitHub Pages friendly */
const $ = (id) => document.getElementById(id);

const state = {
  vocab: [],
  items: [],
  deck: [],
  idx: 0,
  score: 0,
  locked: false
};

function normalize(s){ return (s||"").toString().trim().toLowerCase(); }

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setStatus(msg){ $("status").textContent = msg; }

function buildDeck(){
  const sel = $("count").value;
  const all = state.items.map((_, i) => i);
  shuffle(all);

  let count = state.items.length;
  if (sel !== "all"){
    const n = parseInt(sel, 10);
    if (!Number.isNaN(n)) count = Math.min(n, state.items.length);
  }

  state.deck = all.slice(0, count);
  state.idx = 0;
  state.score = 0;
  state.locked = false;

  $("game").hidden = false;
  nextQuestion();
}

function pickDistractors(correctTerm, unit){
  const mode = $("distractors").value;
  let pool = state.vocab.filter(v => normalize(v.en) !== normalize(correctTerm));

  if (mode === "unit"){
    const sameUnit = pool.filter(v => (v.unit || "") === (unit || ""));
    if (sameUnit.length >= 3) pool = sameUnit;
  }

  shuffle(pool);
  const out = [];
  for (const v of pool){
    if (out.length >= 3) break;
    out.push(v.en);
  }
  return out;
}

function renderOptions(correct, unit){
  const distractors = pickDistractors(correct, unit);
  const opts = shuffle([correct, ...distractors]);

  $("options").innerHTML = "";
  for (const o of opts){
    const btn = document.createElement("button");
    btn.className = "opt";
    btn.type = "button";
    btn.textContent = o;
    btn.addEventListener("click", () => choose(btn, o, correct));
    $("options").appendChild(btn);
  }
}

function choose(btn, picked, correct){
  if (state.locked) return;
  state.locked = true;

  const buttons = [...document.querySelectorAll("#options .opt")];
  for (const b of buttons){
    const val = b.textContent;
    if (normalize(val) === normalize(correct)) b.classList.add("correct");
    else if (normalize(val) === normalize(picked)) b.classList.add("wrong");
    b.disabled = true;
  }

  if (normalize(picked) === normalize(correct)){
    state.score += 1;
  }

  $("score").textContent = `Tulemus: ${state.score} / ${state.deck.length}`;
  $("nextBtn").disabled = false;
}

function nextQuestion(){
  const total = state.deck.length;
  const i = state.idx;

  if (i >= total){
    $("sentence").textContent = "Valmis! 🎉";
    $("hint").textContent = "";
    $("options").innerHTML = "";
    $("counter").textContent = `Lüngad: ${total} / ${total}`;
    $("nextBtn").disabled = true;
    return;
  }

  const item = state.items[state.deck[i]];
  $("sentence").textContent = item.blank;
  $("hint").textContent = `Unit: ${item.unit} • EE vaste: ${termToEE(item.term)}`;

  $("counter").textContent = `Lüngad: ${i + 1} / ${total}`;
  $("score").textContent = `Tulemus: ${state.score} / ${total}`;

  state.locked = false;
  $("nextBtn").disabled = true;
  renderOptions(item.term, item.unit);
}

function termToEE(en){
  const hit = state.vocab.find(v => normalize(v.en) === normalize(en));
  return hit ? hit.ee : "—";
}

async function init(){
  $("startBtn").addEventListener("click", buildDeck);
  $("shuffleBtn").addEventListener("click", buildDeck);
  $("restartBtn").addEventListener("click", buildDeck);
  $("nextBtn").addEventListener("click", () => { state.idx += 1; nextQuestion(); });

  const [vResp, cResp] = await Promise.all([
    fetch("data/vocab.json"),
    fetch("data/cloze.json")
  ]);

  const vocab = await vResp.json();
  const cloze = await cResp.json();

  state.vocab = vocab.pairs || [];
  state.items = cloze.items || [];

  setStatus(`Valmis • Lünki: ${state.items.length} • Sõnu: ${state.vocab.length}`);
}

init().catch(err => {
  console.error(err);
  setStatus("Viga andmete laadimisel. Kontrolli, et 'data/vocab.json' ja 'data/cloze.json' on olemas.");
});
