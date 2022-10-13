'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const PASSAGE = 'PASSAGE'

const GLUE = 'GLUE'
const BALL = 'BALL'
const GAMER = 'GAMER'

const GAMER_IMG = '\n\t\t<img src="img/gamer.png">\n'
const GLUED_GAMER = '\n\t\t <img src="img/gamer-purple.png">\n'
const BALL_IMG = '\n\t\t<img src="img/ball.png">\n'

// Global Vars:
var gBoard
var gGamerPos
var gRandomBallInterval
var gUserBallCount
var gBallCount
var gCreateGlueInterval
var gClearGlueInterval

// Main Functions
function initGame() {
    gUserBallCount = 0
    gBallCount = 2
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()

    document.querySelector('h3').style.display = 'none'
    renderBoard(gBoard)
    gRandomBallInterval = setInterval(renderRandomBall, 2000)
    gCreateGlueInterval = setInterval(renderGlue, 5000)
}

function moveTo(i, j) {

    // Calculate distance to make sure we are moving to a neighbor cell
    var isValidDiff = (Math.abs(Math.abs(i - gGamerPos.i) - Math.abs(j - gGamerPos.j)) === 1)

    if (isPassage(i, j)) {
        i = iPassageExit(i)
        j = jPassageExit(j)
        isValidDiff = 1
    }

    var targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    if (isValidDiff) {
    
        if (targetCell.gameElement === BALL) {  // Handle Ball Collection
            // Model
            gUserBallCount++

            //DOM
            renderCollecting()
        }

        // Update the Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null

        // DOM:
        renderCell(gGamerPos, '') 

        // Update the Model:
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }

        // DOM:
        if (targetCell.type === GLUE) renderCell(gGamerPos, GLUED_GAMER)
        else renderCell(gGamerPos, GAMER_IMG)

        // Check For Win
        if (gUserBallCount === gBallCount) runWinSequence()

    } else console.log('TOO FAR')

}

function handleKey(event) { 

    var i = gGamerPos.i // 0 
    var j = gGamerPos.j // 6

    var currCell = gBoard[i][j]

    if (currCell.type === GLUE) {
        return
    } 

    switch (event.key) {  
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break;
        case 'ArrowRight':
            moveTo(i, j + 1)
            break;
        case 'ArrowUp':
            moveTo(i - 1, j)
            break;
        case 'ArrowDown':
            moveTo(i + 1, j)
            break;
    }
}



// Model Functions
function buildBoard() {
    var board = []

    // TODO: Create the Matrix 10 * 12 
    board = createMat(10, 12)

    // TODO: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === board.length - 1) board[i][j].type = WALL
            else if (j === 0 || j === board[i].length - 1) board[i][j].type = WALL
        
        }
    }

    // TODO: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[4][7].gameElement = BALL
    board[3][3].gameElement = BALL

    // Handle Passages
    board[0][6].type = PASSAGE
    // board[0][6].exitCoords = {i: 9, j: 6}

    board[9][6].type = PASSAGE
    // board[9][6].exitCoords = {i: 0, j: 6}
    
    board[5][0].type = PASSAGE
    // board[5][0].exitCoords = {i: 5, j: 11}
    
    board[5][11].type = PASSAGE
    // board[5][11].exitCoords = {i: 5, j: 0}

    return board;
}



// DOM Functions
function renderBoard(board) {

    var elBoard = document.querySelector('.board')
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'

        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var cellClass = getClassName({ i, j })

            if (currCell.type === FLOOR || currCell.type === PASSAGE) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i}, ${j})">`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG;
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG;
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML
}

function renderCell(location, value) {
    // Model
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector)
    // DOM
    elCell.innerHTML = value
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function renderRandomBall() {
    var i = getRandomIntInclusive(1, (gBoard.length - 2))
    var j = getRandomIntInclusive(1, (gBoard[0].length - 2))

    // while (gBoard[i][j].gameElement) {
    //     i = getRandomIntInclusive(1, gBoard.length - 2)
    //     j = getRandomIntInclusive(1, gBoard[0].length - 2)
    // }

    // Model
    gBoard[i][j].gameElement = BALL
    gBallCount++

    //DOM
    renderCell({ i, j }, `<img src="img/ball.png">`) // BALL_IMG
}

function renderGlue() { 
    var i = getRandomIntInclusive(1, gBoard.length - 2)
    var j = getRandomIntInclusive(1, gBoard[0].length - 2)

    while (gBoard[i][j].gameElement) {
        i = getRandomIntInclusive(1, gBoard.length - 2)
        j = getRandomIntInclusive(1, gBoard[0].length - 2)
    }

    // Handle Model
    gBoard[i][j].type = GLUE

    // Handle DOM
    document.querySelector(`.cell-${i}-${j}`).classList.remove('floor')
    document.querySelector(`.cell-${i}-${j}`).classList.add('glue')

    gClearGlueInterval = setTimeout(clearGlue, 5000, {i, j})    
}

function clearGlue(coords) {
    // MODEL
    gBoard[coords.i][coords.j].type = FLOOR

    // DOM
    document.querySelector(`.cell-${coords.i}-${coords.j}`).classList.add('floor')
    document.querySelector(`.cell-${coords.i}-${coords.j}`).classList.remove('glue')   
}

function runWinSequence() {
    // Model
    clearInterval(gRandomBallInterval)
    gRandomBallInterval = 0
    clearInterval(gCreateGlueInterval)
    gCreateGlueInterval = 0
    clearInterval(gClearGlueInterval)
    gClearGlueInterval = 0

    // DOM
    document.querySelector('h3').style.display = 'block'
}

function renderCollecting() {
    document.querySelector('h2 span').innerText = gUserBallCount
    var collectSound = new Audio('sound/collect-ball-sound.wav')
    collectSound.play()
}


// Util Functions
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function isPassage(i, j) {
    return (i < 0 || j < 0 || i >= gBoard.length || j >= gBoard[0].length)
}

function jPassageExit(j) {
    if (j === -1)        return 11
    else if (j === 12)   return 0
    return j
}

function iPassageExit(i) {
    if (i === -1)        return 9
    else if (i === 10)   return 0
    return i
}






