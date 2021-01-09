const FRAME_RATE = 10

function createGameState() {
    return {
        players: [
            {
                pos: {
                    x: 7,
                    y: 10
                },
                vel: {
                    x: 1,
                    y: 0
                },
                snakes: [
                    { x: 4, y: 10 },
                    { x: 5, y: 10 },
                    { x: 6, y: 10 }
                ]
            },
            {
                pos: {
                    x: 7,
                    y: 20
                },
                vel: {
                    x: 1,
                    y: 0
                },
                snakes: [
                    { x: 4, y: 20 },
                    { x: 5, y: 20 },
                    { x: 6, y: 20 }
                ]
            }
        ],
        food: {
            x: 13,
            y: 23
        },
        numberOfTiles: 30
    }
}

function runGame(state) {
    let playerOne = state.players[0];
    let playerTwo = state.players[1];
    if(playerOne.pos.x < 0 || playerOne.pos.x > state.numberOfTiles || playerOne.pos.y < 0 || playerOne.pos.y > state.numberOfTiles) {
        return 2
    }
    if(playerTwo.pos.x < 0 || playerTwo.pos.x > state.numberOfTiles || playerTwo.pos.y < 0 || playerTwo.pos.y > state.numberOfTiles) {
        return 1
    }

    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    if(playerOne.vel.x || playerOne.vel.y) {
        for(let cell of playerOne.snakes) {
            if(cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2
            }
        }
    }
    if(playerTwo.vel.x || playerTwo.vel.y) {
        for(let cell of playerTwo.snakes) {
            if(cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                return 1
            }
        }
    }

    if(state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snakes.push({ ...playerOne.pos })
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        randomFood(state)
    }
    if(state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        playerTwo.snakes.push({ ...playerTwo.pos })
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        randomFood(state)
    }

    playerOne.snakes.push({ ...playerOne.pos })
    playerOne.snakes.shift()
    playerTwo.snakes.push({ ...playerTwo.pos })
    playerTwo.snakes.shift()

    return false
}

function handleKeyCode(keyCode, state, clientNumber) {
    let player = state.players[clientNumber - 1];
    switch(keyCode) {
        case 83: { // w
            player.vel = { x: 0, y: 1 }
        }
        break
        case 87: { // s
            player.vel = { x: 0, y: -1 }
        }
        break
        case 65: { // a
            player.vel = { x: -1, y: 0 }
        }
        break
        case 68: { // d
            player.vel = { x: 1, y: 0 }
        }
        break
    }
}

function randomFood(state) {
    state.food = {
        x: Math.floor(Math.random() * state.numberOfTiles),
        y: Math.floor(Math.random() * state.numberOfTiles)
    }
}

function createGameCode(length) {
    let e = 'QWERTYUIOPLKJHGFDSAZXCVBNMqazxswedcvfrtgbnhyujmkiolp123456789'
    let result = []
    for(let i = 0; i < length; i++) {
        result.push(e[Math.floor(Math.random() * e.length)])
    }
    return result.join('')
}

module.exports = {
    createGameState,
    FRAME_RATE,
    runGame,
    handleKeyCode,
    randomFood,
    createGameCode
}