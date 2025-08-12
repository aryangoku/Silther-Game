let inputDir = { x: 0, y: 0 };
const moveSound = new Audio("move.mp3");
const foodSound = new Audio("food.mp3");
const gameOverSound = new Audio("gameover.mp3");

const GRID_MIN = 2, GRID_MAX = 16, GRID_SIZE = 18;
let speed = 9;
let lastPaintTime = 0;

let snakeArr = [{ x: 13, y: 15 }];
let food = { x: 6, y: 7 };
let score = 0;

let gameStarted = false;
let paused = false;
let gameOver = false;
let inputQueued = false;

const playArea = document.getElementById("playArea");
const scorebox = document.getElementById("scorebox");
const hiscorebox = document.getElementById("hiscorebox");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMsg = document.getElementById("overlayMsg");
const overlayPlay = document.getElementById("overlayPlay");
const overlayBtn = document.getElementById("overlayBtn");
const gameWrap = document.querySelector(".game-wrap");
const btnRestart = document.getElementById("btnRestart");
const btnPause = document.getElementById("btnPause");
const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");

let hiscore = localStorage.getItem("hiscore");
let hiscoreval = hiscore ? JSON.parse(hiscore) : 0;
hiscorebox.textContent = hiscoreval;

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function randomEmptyCell(exclude){
  let p;
  do { p = { x: randInt(GRID_MIN, GRID_MAX), y: randInt(GRID_MIN, GRID_MAX) }; }
  while (exclude.some(e => e.x === p.x && e.y === p.y));
  return p;
}
function randomFood(){ return randomEmptyCell(snakeArr); }
function randomStart(){
  const head = randomEmptyCell([]);
  const dirs = [];
  if (head.y > GRID_MIN) dirs.push({x:0,y:-1});
  if (head.y < GRID_MAX) dirs.push({x:0,y: 1});
  if (head.x > GRID_MIN) dirs.push({x:-1,y:0});
  if (head.x < GRID_MAX) dirs.push({x: 1,y:0});
  const dir = dirs[Math.floor(Math.random()*dirs.length)];
  return { head, dir };
}

function showOverlay(title, msg, mode){
  if (!overlay) return;
  overlayTitle.textContent = title;
  overlayMsg.textContent = msg;
  if (overlayPlay) overlayPlay.style.display = mode === "start" ? "inline-block" : "none";
  if (overlayBtn) overlayBtn.style.display  = mode === "over"  ? "inline-block" : "none";
  overlay.hidden = false;
  gameWrap?.classList.add("overlay-active");
}

function hideOverlay(){
  if (!overlay) return;
  overlay.hidden = true;
  gameWrap?.classList.remove("overlay-active");
}

function resetGame(){
  const start = randomStart();
  snakeArr = [{ x: start.head.x, y: start.head.y }];
  inputDir = start.dir;
  score = 0;
  scorebox.textContent = score;
  food = randomFood();
  gameOver = false;
  paused = false;
  gameStarted = true;
  inputQueued = false;
  lastPaintTime = 0;
  hideOverlay();
}

function main(ctime){
  window.requestAnimationFrame(main);
  if (!gameStarted || paused || gameOver) return;
  if ((ctime - lastPaintTime) / 1000 < 1 / speed) return;
  lastPaintTime = ctime;
  gameEngine();
  inputQueued = false;
}

function collide(snake){
  for (let i = 1; i < snake.length; i++){
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  if (snake[0].x >= GRID_SIZE || snake[0].x <= 0 || snake[0].y >= GRID_SIZE || snake[0].y <= 0) return true;
  return false;
}

function gameEngine(){
  if (collide(snakeArr)){
    gameOverSound.play();
    inputDir = { x: 0, y: 0 };
    gameOver = true;
    showOverlay("Game Over", "Press Space or click Play again", "over");
    return;
  }

  if (snakeArr[0].x === food.x && snakeArr[0].y === food.y){
    foodSound.play();
    score++;
    if (score > hiscoreval){
      hiscoreval = score;
      localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
      hiscorebox.textContent = hiscoreval;
    }
    scorebox.textContent = score;
    snakeArr.unshift({ x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y });
    food = randomFood();
  }

  for (let i = snakeArr.length - 2; i >= 0; i--){
    snakeArr[i + 1] = { ...snakeArr[i] };
  }
  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;

  playArea.innerHTML = "";
  snakeArr.forEach((e, idx) => {
    const el = document.createElement("div");
    el.style.gridRowStart = e.y;
    el.style.gridColumnStart = e.x;
    el.className = idx === 0 ? "head" : "snake";
    playArea.appendChild(el);
  });

  const foodEl = document.createElement("div");
  foodEl.style.gridRowStart = food.y;
  foodEl.style.gridColumnStart = food.x;
  foodEl.className = "food";
  playArea.appendChild(foodEl);
}

function setDir(nx, ny){
  if (inputQueued) return;
  if (nx === -inputDir.x && ny === -inputDir.y) return;
  inputDir = { x: nx, y: ny };
  inputQueued = true;
}

overlayPlay?.addEventListener("click", () => { resetGame(); });
overlayBtn?.addEventListener("click", () => { resetGame(); });
btnRestart?.addEventListener("click", () => { resetGame(); });

btnPause?.addEventListener("click", () => {
  if (!gameStarted || gameOver) return;
  paused = !paused;
  btnPause.setAttribute("aria-pressed", String(paused));
  if (!paused) lastPaintTime = 0;
});

window.addEventListener("keydown", (e) => {
  if (gameOver && e.code === "Space"){ resetGame(); return; }
  if (!gameStarted){
    resetGame();
  }
  if (gameOver || paused) return;
  switch (e.key){
    case "ArrowUp":    setDir(0,-1); break;
    case "ArrowDown":  setDir(0, 1); break;
    case "ArrowLeft":  setDir(-1,0); break;
    case "ArrowRight": setDir(1, 0); break;
    case " ":
      paused = !paused;
      btnPause?.setAttribute("aria-pressed", String(paused));
      if (!paused) lastPaintTime = 0;
      break;
  }
});

let touchStartX = 0, touchStartY = 0, swiping = false;
playArea.addEventListener('touchstart', (e)=>{
  if (!gameStarted) resetGame();
  const t = e.changedTouches[0];
  touchStartX = t.clientX; touchStartY = t.clientY; swiping = true;
}, {passive:true});
playArea.addEventListener('touchmove', (e)=>{ e.preventDefault(); }, {passive:false});
playArea.addEventListener('touchend', (e)=>{
  if (!swiping) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  const threshold = 24;
  if (absX < threshold && absY < threshold) return;
  if (absX > absY){ setDir(dx > 0 ? 1 : -1, 0); }
  else{ setDir(0, dy > 0 ? 1 : -1); }
  swiping = false;
}, {passive:true});

btnUp?.addEventListener('click',   () => setDir(0,-1));
btnDown?.addEventListener('click', () => setDir(0, 1));
btnLeft?.addEventListener('click', () => setDir(-1,0));
btnRight?.addEventListener('click',() => setDir(1, 0));

showOverlay("Ready?", "Press any arrow key or click Play to start", "start");
window.requestAnimationFrame(main);
