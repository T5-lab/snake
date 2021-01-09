const GAME_COLOR = '#1d1d1d';
const FIRST_SNAKE_COLOR = '#85144b';
const SECOND_SNAKE_COLOR = '#7FDBFF';
const FOOD_COLOR = 'orange';

let socket = io();

let gameContainer = document.getElementById('game-container');
let formContainer = document.getElementById('form-container')
let createGameBtn = document.getElementById('create-game-btn');
let joinGameBtn = document.getElementById('join-game-btn');
let roomInput = document.getElementById('roomCode');
let popup = document.getElementById('popup-container');
let s1 = document.getElementById('score1')
let s2 = document.getElementById('score2')
let counter = document.getElementById('counter')
let counterNumber = document.getElementById('counter-number')
let playAgainBtn = document.getElementById('play-again-btn')
let lobbyBtn = document.getElementById('lobby-btn')
let canvas, ctx, playerNumber;

createGameBtn.addEventListener('click', createGame)
joinGameBtn.addEventListener('click', joinGame)
playAgainBtn.addEventListener('click', playAgain)
lobbyBtn.addEventListener('click', returnToLobby)

socket.on('init', state => onConnect(state))
socket.on('updateState', state => updateState(state))
socket.on('gameOver', state => gameOver(state))
socket.on('gameCode', gameCode => setGameCode(gameCode))
socket.on('gameStarting', gameStarting)
socket.on('rematchStarting', rematchStarting)
socket.on('thisRoomIsNoLongerAvailable', () => {
  formContainer.style.display = 'flex'
  gameContainer.style.display = 'none'
  popup.style.display = 'none'
  alert('this room is no longer available')
})
socket.on('roomDoesNotExistAnymore', () => {
  formContainer.style.display = 'flex'
  gameContainer.style.display = 'none'
  alert('room does not exist anymore')
})
socket.on('roomIsAlreadyFull', () => {
  formContainer.style.display = 'flex'
  gameContainer.style.display = 'none'
  alert('room is already full')
})

function onConnect(state) {
  state = JSON.parse(state);
  init(state)
}

function init(state) {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  document.addEventListener('keydown', handleKeyDown)

  canvas.width = canvas.height = 600

  ctx.fillStyle = GAME_COLOR
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function updateState(state) {
  counter++;
  state = JSON.parse(state)
  ctx.fillStyle = GAME_COLOR
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let playerOne = state.players[0];
  let playerTwo = state.players[1];

  const size = canvas.width / state.numberOfTiles
  ctx.fillStyle = FIRST_SNAKE_COLOR
  ctx.fillRect(playerOne.pos.x * size, playerOne.pos.y * size, size, size)
  for(let cell of playerOne.snakes) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size)
  }
  ctx.fillStyle = SECOND_SNAKE_COLOR
  ctx.fillRect(playerTwo.pos.x * size, playerTwo.pos.y * size, size, size)
  for(let cell of playerTwo.snakes) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size)
  }
  ctx.fillStyle = FOOD_COLOR
  ctx.fillRect(state.food.x * size, state.food.y * size, size, size)
}

function gameOver(state) {
  s1.innerText = (state.players[0].snakes.length - 3).toString();
  s2.innerText = (state.players[1].snakes.length - 3).toString();
  popup.style.display =  'flex';
}

function handleKeyDown(e) {
  socket.emit('keydown', e.keyCode)
}

function createGame() {
  playerNumber = 1
  formContainer.style.display = 'none'
  gameContainer.style.display = 'flex'
  socket.emit('createGame')
}

function setGameCode(gameCode) {
  document.getElementById('code').innerText = gameCode
}

function joinGame() {
  playerNumber = 2
  formContainer.style.display = 'none'
  gameContainer.style.display = 'flex'
  const gameCode = roomInput.value;
  socket.emit('joinGame', gameCode)
}

function gameStarting() {
  counter = document.getElementById('counter')
  counter.style.display = 'flex';
  let i = 3
  counterNumber.innerText = i.toString()
  let intervalId = setInterval(() => {
    i--;
    counterNumber.innerText = i.toString()
  }, 1000)
  setTimeout(() => {
    counter.style.display = 'none';
    clearInterval(intervalId)
  }, 3000)
}

function playAgain() {
  if(playerNumber === 1) {
    socket.emit('playAgain')
  } else {
    alert('Only Room Creator Can Restart The Game')
  }
}

function rematchStarting() {
  popup.style.display = 'none';
  gameStarting()
}

function returnToLobby() {
  gameContainer.style.display = 'none'
  formContainer.style.display = 'flex'
  popup.style.display = 'none'
  socket.emit('deleteRoom')
}