const http = require('http')
const express = require('express')
const socketIO = require('socket.io')
const path = require('path')
const { createGameState, FRAME_RATE, runGame, handleKeyCode, createGameCode, randomFood } = require('./game')

const app = express()
const PORT = process.env.PORT || 9000
const server = http.createServer(app)
const io = socketIO(server)

let rooms = {}
let clientsInRoom = {}

io.on('connection', client => {
  client.on('createGame', () => {
    let gameCode = createGameCode(5)
    client.gameCode = gameCode;
    let state = createGameState()
    client.number = 1;
    client.emit('init', JSON.stringify(state))
    client.emit('gameCode', gameCode)
    client.join(gameCode)
    clientsInRoom[gameCode] = [client]
    client.on('keydown', keyCode => handleKeyCode(keyCode, state, client.number))
    rooms[gameCode] = state;
  })

  client.on('joinGame', gameCode => {
    if(clientsInRoom[gameCode]) {
      if(clientsInRoom[gameCode].length < 1) {
        return client.emit('roomDoesNotExistAnymore')
      } else if(clientsInRoom[gameCode].length > 1) {
        return client.emit('roomIsAlreadyFull')
      }
    } else {
      return client.emit('roomDoesNotExistAnymore')
    }
    let state = rooms[gameCode]
    client.number = 2
    client.emit('init', JSON.stringify(state))
    client.emit('gameCode', gameCode)
    client.join(gameCode)
    client.gameCode = gameCode;
    clientsInRoom[gameCode].push(client)
    client.on('keydown', keyCode => handleKeyCode(keyCode, state, client.number))
    io.sockets.in(gameCode).emit('gameStarting')
    setTimeout(() => {
      let intervalId = setInterval(() => handleInterval(gameCode, intervalId, state), 1000 / FRAME_RATE)
    }, 3000)
  })

  client.on('playAgain', () => {
    const {gameCode} = client;
    if(!rooms[gameCode]) return client.emit('thisRoomIsNoLongerAvailable')
    let state = createGameState()
    client.on('keydown', keyCode => handleKeyCode(keyCode, state, client.number))
    io.sockets.in(gameCode).emit('rematchStarting')
    setTimeout(() => {
      let intervalId = setInterval(() => handleInterval(gameCode, intervalId, state), 1000 / FRAME_RATE)
    }, 3000)
  })

  client.on('deleteRoom', () => {
    rooms[client.gameCode] = undefined
    clientsInRoom[client.gameCode] = undefined
  })
})

function handleInterval(gameCode, intervalId, state) {
  const winner = runGame(state)
  if(winner) {
    clearInterval(intervalId)
    return io.sockets.in(gameCode).emit('gameOver', state)
  }
  io.sockets.in(gameCode).emit('updateState', JSON.stringify(state))
}

app.use(express.static(path.resolve(__dirname, '..', 'frontend')))

app.get('/', (req, res, next) => {
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html'))
})

server.listen(PORT, () => console.log(`server is listening to port ${PORT}`))
