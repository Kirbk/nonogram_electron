var horiz = 0;
var vert  = 0;
var cell_width = 0, cell_height = 0;
var max_width = 0, max_height = 0;
var board, vert_wall, horiz_wall;
var sol = false;

function setupRandom() {
  horiz = 10;
  vert  = 10;

  board = new Array(vert);
  for (var i = 0; i < vert; i++) board[i] = new Array(horiz);

  vert_wall  = new Array(vert);
  for (var i = 0; i < vert; i++) vert_wall[i] = [];

  horiz_wall = new Array(horiz);
  for (var i = 0; i < horiz; i++) horiz_wall[i] = [];

  for (var i = 0; i < vert; i++) {
    for (var j = 0; j < horiz; j++) {
      board[i][j] = new Cell(Math.random() > 0.5);
    }
  }

  after();
}

function after() {
  createCanvas(900, 900);
  getWalls();

  for (var i = 0; i < horiz; i++) {
    max_width = Math.max(max_width, horiz_wall[i].length);
  }
  for (var i = 0; i < vert; i++) {
    max_height = Math.max(max_height, vert_wall[i].length);
  }

  cell_width  = width  / (horiz + max_width);
  cell_height = height / (vert + max_height);

  loop();
}

async function getLevel(url) {
  return fetch(url)
    .then(response => response.json())
}

var b;
var loaded = false;

function start() {
  vert = b.level_data.length;
  horiz = b.level_data[0].length;

  board = new Array(vert);
  for (var i = 0; i < vert; i++) board[i] = new Array(horiz);

  for (var i = 0; i < vert; i++) {
    for (var j = 0; j < horiz; j++) {
      board[i][j] = new Cell(b.level_data[i][j] === 1);
    }
  }

  vert_wall  = new Array(vert);
  for (var i = 0; i < vert; i++) vert_wall[i] = [];

  horiz_wall = new Array(horiz);
  for (var i = 0; i < horiz; i++) horiz_wall[i] = [];
  // rewrite();

  after();
}

function waitForElement(){
  if(typeof b !== "undefined"){
    loaded = true;
    start();
  }
  else{
      setTimeout(waitForElement, 250);
  }
}

async function initialize() {
  if (typeof filename !== 'undefined') {
    var lvl = atob(filename);
    if (lvl === "none") {
      setupRandom();
    } else {
      b = await getLevel("levels/" + lvl);
      waitForElement();
    }
  } else {
    setupRandom();
  }
}

document.oncontextmenu = function() {
  return false;
}

function getWalls() {
  for (var i = 0; i < vert; i++) {
    for (var j = 0; j < horiz; j++) {
      let y = 0;
      while (board[i][j] && board[i][j].lit) {
        y++;
        j++;
      }
      if (y > 0) vert_wall[i].push(y);
    }
  }

  for (var i = 0; i < horiz; i++) {
    for (var j = 0; j < vert; j++) {
      let x = 0;
      while (board[j] && board[j][i].lit) {
        x++;
        j++;
      }
      if (x > 0) horiz_wall[i].push(x);
    }
  }
}

function setup() {
  noLoop();
  initialize();
}

function checkWin() {
  let win = true;
  for (var i = 0; i < vert; i++) {
    for (var j = 0; j < horiz; j++) {
      if (board[i][j].lit != board[i][j].active) {
        win = false;
        break;
      }
    }
  }

  return win;
}

function update(x, y) {
  fill(255);
  if (board[y][x].cant) fill(255, 0, 0);
  if (board[y][x].active) fill(51);
  rect((x + (max_height / 2)) * cell_width, (y + (max_width / 2)) * cell_height, cell_width, cell_height);

  if (checkWin()) document.getElementById("win").innerHTML = "You win!";
}

function rewrite(solution = false) {
  background(255);
  for (var i = 0; i < vert; i++) {
    for (var j = 0; j < horiz; j++) {
      fill(255);
      if (board[i][j].cant && !solution) fill(255, 0, 0);
      if (board[i][j].active && !solution) fill(51);
      if (solution && board[i][j].lit) fill(200);
      rect((j + (max_height / 2)) * cell_width, (i + (max_width / 2)) * cell_height, cell_width, cell_height);
    }
  }

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(cell_height / 3);
  for (var i = 0; i < vert; i++) {
    let x = max_height;
    for (var j = vert_wall[i].length - 1; j >= 0; j--) {
      text(str(vert_wall[i][j]), cell_width * --x / 2 + cell_width / 4, ((max_width / 2) + i) * cell_height + (cell_height / 2));
    }
  }

  textSize(cell_width / 3);
  for (var i = 0; i < horiz; i++) {
    let y = max_width;
    for (var j = horiz_wall[i].length - 1; j >= 0; j--) {
      text(str(horiz_wall[i][j]), ((max_height / 2) + i) * cell_width + (cell_width / 2), cell_height * --y / 2 + cell_height / 4);
    }
  }
}

function keyPressed() {
  if (key === 's') {
    sol = true;
    rewrite(true);
  }
  if (key === 'c')
    document.getElementById("win").innerHTML = checkWin() ? "You win!" : "Not quite!";

  if (key === 'n') {
    for (var i = 0; i < vert; i++) {
      for (var j = 0; j < horiz; j++) {
        board[i][j].active = false;
        board[i][j].cant = false;
        rewrite();
      }
    }
  }

  if (key === 'h') {
    if (checkWin()) return;
    while (true) {
      let cell = random(random(board));
      if (cell.lit && !cell.active) {
        cell.active = true;
        rewrite();
        break;
      }
    }
  }
}

function keyReleased() {
  if (key === 's') {
    sol = false;
    rewrite(false);
  }
}

function mousePressed() {
  if (sol) return;
  let x = Math.floor(mouseX / cell_width - (max_height / 2));
  let y = Math.floor(mouseY / cell_height - (max_width / 2));
  if (x < horiz && y < vert && x >= 0 && y >= 0) {
    if (mouseButton === LEFT)
      board[y][x].active = !board[y][x].active;
    else if (mouseButton === RIGHT) {
      board[y][x].cant = !board[y][x].cant;
    }
    update(x, y);
  }
}

function draw() {
  rewrite();
  noLoop();
}


class Cell {
  constructor(lit) {
    this.lit = lit;
    this.active = false;
    this.cant = false;
  }
}
