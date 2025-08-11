let inputDir = { x: 0, y: 0 };
const moveSound = new Audio("move.mp3");
const foodSound = new Audio("food.mp3");
const gameOverSound = new Audio("gameover.mp3");
let speed = 9;
let lastPaintTime = 0;
let snakeArr = [{ x: 13, y: 15 }];
let food = { x: 6, y: 7 };
let score = 0;
let gameOver = false;

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMsg = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");
const btnRestart = document.getElementById("btnRestart");
const btnPause = document.getElementById("btnPause");

function main(ctime) {
  window.requestAnimationFrame(main);
  if (gameOver) return;
  if ((ctime - lastPaintTime) / 1000 < 1 / speed) return;
  lastPaintTime = ctime;
  gameEngine();
}

function collide(snake) {
  for (let i = 1; i < snakeArr.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  if (snake[0].x >= 18 || snake[0].x <= 0 || snake[0].y >= 18 || snake[0].y <= 0) return true;
  return false;
}

function randomFood() {
  const a = 2, b = 16;
  return {
    x: Math.round(a + (b - a) * Math.random()),
    y: Math.round(a + (b - a) * Math.random())
  };
}

function resetGame() {
  snakeArr = [{ x: 13, y: 15 }];
  inputDir = { x: 0, y: 1 };
  score = 0;
  scorebox.innerHTML = "Score: " + score;
  food = randomFood();
  overlay.hidden = true;
  gameOver = false;
  lastPaintTime = 0;
}

function gameEngine() {
  if (collide(snakeArr)) {
    gameOverSound.play();
    inputDir = { x: 0, y: 0 };
    gameOver = true;
    overlayTitle.textContent = "Game Over";
    overlayMsg.textContent = "Press Space or click below to play again";
    overlay.hidden = false;
    return;
  }

  if (snakeArr[0].y === food.y && snakeArr[0].x === food.x) {
    foodSound.play();
    score++;
    if (score > hiscoreval) {
      hiscoreval = score;
      localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
      hiscorebox.innerHTML = "Hiscore: " + hiscoreval;
    }
    scorebox.innerHTML = "Score: " + score;
    snakeArr.unshift({ x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y });
    food = randomFood();
  }

  for (let i = snakeArr.length - 2; i >= 0; i--) {
    snakeArr[i + 1] = { ...snakeArr[i] };
  }

  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;

  playArea.innerHTML = "";
  snakeArr.forEach((e, index) => {
    const el = document.createElement("div");
    el.style.gridRowStart = e.y;
    el.style.gridColumnStart = e.x;
    el.classList.add(index === 0 ? "head" : "snake");
    playArea.appendChild(el);
  });

  const foodEl = document.createElement("div");
  foodEl.style.gridRowStart = food.y;
  foodEl.style.gridColumnStart = food.x;
  foodEl.classList.add("food");
  playArea.appendChild(foodEl);
}

let hiscore = localStorage.getItem("hiscore");
let hiscoreval;
if (hiscore === null) {
  hiscoreval = 0;
  localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
} else {
  hiscoreval = JSON.parse(hiscore);
  hiscorebox.innerHTML = "Hiscore: " + hiscoreval;
}

if (overlayBtn) overlayBtn.addEventListener("click", resetGame);
if (btnRestart) btnRestart.addEventListener("click", resetGame);
if (btnPause) btnPause.addEventListener("click", () => {
  gameOver = !gameOver;
  if (!gameOver) lastPaintTime = 0;
});

window.requestAnimationFrame(main);

window.addEventListener("keydown", e => {
  if (gameOver && e.code === "Space") {
    resetGame();
    return;
  }
  if (gameOver) return;
  switch (e.key) {
    case "ArrowUp":
      inputDir = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      inputDir = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      inputDir = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      inputDir = { x: 1, y: 0 };
      break;
    default:
      break;
  }
});
const GRID_MIN = 2, GRID_MAX = 16;

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

function randomEmptyCell(exclude){
  let p;
  do {
    p = { x: randInt(GRID_MIN, GRID_MAX), y: randInt(GRID_MIN, GRID_MAX) };
  } while (exclude.some(e => e.x === p.x && e.y === p.y));
  return p;
}

function randomFood(){            // replaces your old randomFood()
  return randomEmptyCell(snakeArr);
}

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

function resetGame(){             
  const start = randomStart();
  snakeArr = [{ x: start.head.x, y: start.head.y }];
  inputDir = start.dir;
  score = 0;
  scorebox.innerHTML = "Score: " + score;
  food = randomFood();
  overlay.hidden = true;
  gameOver = false;
  lastPaintTime = 0;
}

resetGame();
window.requestAnimationFrame(main);
