window.onload = function () {
  const canvas = document.getElementById("canvas");
  const scoreElement = document.getElementById("score");
  const retryButton = document.getElementById("retry-button");
  const recordContent = document.getElementById("record-content");
  const tableBody = document.getElementById("table-body");
  const tableContainer = document.getElementById("table-container");
  const nameInput = document.getElementById("input");
  const submitButton = document.getElementsByClassName("submit-button")?.[0];
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  console.log("submitButton", submitButton);

  let game_loop;
  let score = 0;
  let direction = "right";
  let snakeArray = [];
  let food = {};
  let tail = {};
  let records = [
    { name: "Кирилл", score: 31 },
    { name: "Никита", score: 19 },
    { name: "Ваня", score: 15 },
    { name: "Кирилл", score: 31 },
    { name: "Никита", score: 19 },
    { name: "Ваня", score: 15 },
    { name: "Кирилл", score: 31 },
    { name: "Никита", score: 19 },
    { name: "Ваня", score: 15 },
  ];

  const SPEED = 130;
  const CELL_WIDTH = 15;

  function init() {
    canvas.style.display = "block";
    tableContainer.style.display = "none";
    snakeArray = [];
    createSnake();
    createFood();
    score = 0;
    if (game_loop) {
      clearInterval(game_loop);
    }
    game_loop = setInterval(paintCanvas, SPEED);
  }

  function saveRecord() {
    // сортируем по убыванию
    records = records.sort((a, b) => b.score - a.score);
    // находим место для нового рекорда
    const newItemIndex = records.findIndex((element) => score >= element.score);
    const newItem = { name: nameInput.value, score };
    // если найдено место для рекорда и еще есть место
    if (newItemIndex === -1 && records.length < 10) {
      records.push(newItem);
    } else {
      // если такой же счет существует - вставляем над ним
      records.splice(newItemIndex, 0, newItem);
      // обрезаем до десяти рекордов
      records = records.slice(0, 10);
    }
    localStorage.setItem("records", JSON.stringify(records));
    paintTableRecords();
    nameInput.value = "";
    canvas.style.display = "none";
    recordContent.style.display = "none";
    tableContainer.style.display = "flex";
  }

  retryButton.onclick = () => init();
  submitButton.onclick = () => saveRecord();

  if (localStorage.getItem("records")) {
    localStorage.setItem("records", JSON.stringify(records));
  }

  function createSnake() {
    const length = 5;
    for (let i = length - 1; i >= 0; i--) {
      snakeArray.push({
        x: i,
        y: 0,
      });
    }
  }

  function createFood() {
    food = {
      x: Math.round((Math.random() * (canvasWidth - CELL_WIDTH)) / CELL_WIDTH),
      y: Math.round((Math.random() * (canvasHeight - CELL_WIDTH)) / CELL_WIDTH),
    };
  }

  function paintCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    let nx = snakeArray[0].x;
    let ny = snakeArray[0].y;

    if (direction === "right") nx++;
    else if (direction === "left") nx--;
    else if (direction === "up") ny--;
    else if (direction === "down") ny++;

    // если врезался
    if (
      nx === -1 ||
      nx === canvasWidth / CELL_WIDTH ||
      ny === -1 ||
      ny === canvasHeight / CELL_WIDTH ||
      checkCollision(nx, ny, snakeArray)
    ) {
      canvas.style.display = "none";
      if (records.some((rec) => rec.score < score) || records.length <= 10) {
        recordContent.style.display = "flex";
      } else {
        tableContainer.style.display = "flex";
      }
      return;
    }

    //если скушал
    if (nx === food.x && ny === food.y) {
      tail = {
        x: nx,
        y: ny,
      };
      score++;
      createFood();
      scoreElement.innerHTML = score;
    } else {
      tail = snakeArray.pop();
      tail.x = nx;
      tail.y = ny;
    }

    snakeArray.unshift(tail);

    for (let i = 0; i < snakeArray.length; i++) {
      const c = snakeArray[i];
      paintCell(c.x, c.y);
    }

    paintCell(food.x, food.y);

    document.onkeydown = function (event) {
      const key = event.which;
      if (key === 37 && direction != "right") direction = "left";
      else if (key === 38 && direction != "down") direction = "up";
      else if (key === 39 && direction != "left") direction = "right";
      else if (key === 40 && direction != "up") direction = "down";
    };
  }

  function paintCell(x, y) {
    ctx.fillStyle = "red";
    ctx.fillRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    ctx.strokeStyle = "white";
    ctx.strokeRect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
  }

  function checkCollision(x, y, array) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].x === x && array[i].y === y) return true;
    }
    return false;
  }

  const paintTableRecords = () => {
    const records = JSON.parse(localStorage.getItem("records"));
    tableBody.innerHTML = "";
    records.forEach((record, index) => {
      const row = document.createElement("tr");
      const position = document.createElement("td");
      position.innerText = index + 1;
      const name = document.createElement("td");
      name.innerText = record.name;
      const score = document.createElement("td");
      score.innerText = record.score;
      row.appendChild(position);
      row.appendChild(name);
      row.appendChild(score);
      tableBody.appendChild(row);
    });
  };

  paintTableRecords();
};
