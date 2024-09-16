const game = document.getElementById('game');
const phase = document.getElementById('phase');
const startScreen = document.getElementById('startScreen');
const gridSize = 20;
const cells = [];
let pacmanPosition = 0;
let ghostPositions = [38];
let fastGhostPositions = [];
let chasingGhostPosition = null;
const obstacles = [];
const coins = [];
let score = 0;
let currentPhase = 1;
const exitPosition = 399;

function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        game.appendChild(cell);
        cells.push(cell);
    }
    placeObstacles();
    placeCoins();
    cells[exitPosition].classList.add('exit');
}

function isPositionOccupied(position) {
    return pacmanPosition === position ||
        ghostPositions.includes(position) ||
        fastGhostPositions.includes(position) ||
        position === chasingGhostPosition ||
        obstacles.includes(position) ||
        coins.includes(position) ||
        position === exitPosition;
}

function placeObstacles() {
    const numObstacles = Math.min(5 + currentPhase * 2, 40);
    while (obstacles.length < numObstacles) {
        const randomPos = Math.floor(Math.random() * gridSize * gridSize);
        if (!isPositionOccupied(randomPos)) {
            obstacles.push(randomPos);
            cells[randomPos].classList.add('obstacle');
        }
    }
}

function placeCoins() {
    const numCoins = Math.min(5 + currentPhase * 2, 40);
    while (coins.length < numCoins) {
        const randomPos = Math.floor(Math.random() * gridSize * gridSize);
        if (!isPositionOccupied(randomPos)) {
            coins.push(randomPos);
            cells[randomPos].classList.add('coin');
        }
    }
}

function draw() {
    cells.forEach(cell => cell.classList.remove('pacman', 'ghost', 'fast-ghost', 'chasing-ghost'));
    cells[pacmanPosition].classList.add('pacman');
    ghostPositions.forEach(pos => cells[pos].classList.add('ghost'));
    fastGhostPositions.forEach(pos => cells[pos].classList.add('fast-ghost'));
    if (chasingGhostPosition !== null) {
        cells[chasingGhostPosition].classList.add('chasing-ghost');
    }
}

function movePacman(event) {
    let newPosition = pacmanPosition;
    
    switch (event.key) {
        case 'ArrowUp':
            newPosition -= gridSize;
            break;
        case 'ArrowDown':
            newPosition += gridSize;
            break;
        case 'ArrowLeft':
            newPosition -= 1;
            break;
        case 'ArrowRight':
            newPosition += 1;
            break;
    }

    if (newPosition >= 0 && newPosition < gridSize * gridSize && !obstacles.includes(newPosition) && Math.abs(newPosition % gridSize - pacmanPosition % gridSize) <= 1) {
        pacmanPosition = newPosition;
        collectCoin();
        checkExit();
    }

    checkCollision();
    draw();
}

function moveGhosts() {
    ghostPositions = ghostPositions.map(ghostPosition => {
        cells[ghostPosition].classList.remove('ghost');
        const directions = [-1, 1, -gridSize, gridSize];
        let newPos = ghostPosition;
        do {
            newPos = ghostPosition + directions[Math.floor(Math.random() * directions.length)];
        } while (newPos < 0 || newPos >= gridSize * gridSize || isPositionOccupied(newPos) || Math.abs(newPos % gridSize - ghostPosition % gridSize) > 1);
        
        return newPos;
    });
    checkCollision();
    draw();
}

function moveFastGhosts() {
    fastGhostPositions = fastGhostPositions.map(fastGhostPosition => {
        cells[fastGhostPosition].classList.remove('fast-ghost');
        const directions = [-1, 1, -gridSize, gridSize];
        let newPos = fastGhostPosition;
        do {
            newPos = fastGhostPosition + directions[Math.floor(Math.random() * directions.length)];
        } while (newPos < 0 || newPos >= gridSize * gridSize || isPositionOccupied(newPos) || Math.abs(newPos % gridSize - fastGhostPosition % gridSize) > 1);

        return newPos;
    });
    checkCollision();
    draw();
}

function moveChasingGhost() {
    if (chasingGhostPosition === null) return;

    const pacmanRow = Math.floor(pacmanPosition / gridSize);
    const pacmanCol = pacmanPosition % gridSize;
    const ghostRow = Math.floor(chasingGhostPosition / gridSize);
    const ghostCol = chasingGhostPosition % gridSize;

    let newPos = chasingGhostPosition;

    if (pacmanRow < ghostRow) {
        newPos -= gridSize;
    } else if (pacmanRow > ghostRow) {
        newPos += gridSize;
    } else if (pacmanCol < ghostCol) {
        newPos -= 1;
    } else if (pacmanCol > ghostCol) {
        newPos += 1;
    }

    if (!obstacles.includes(newPos) && newPos >= 0 && newPos < gridSize * gridSize && Math.abs(newPos % gridSize - chasingGhostPosition % gridSize) <= 1) {
        chasingGhostPosition = newPos;
    }

    checkCollision();
    draw();
}

function collectCoin() {
    if (coins.includes(pacmanPosition)) {
        score++;
        coins.splice(coins.indexOf(pacmanPosition), 1);
        cells[pacmanPosition].classList.remove('coin'); 
    } 
}

function checkCollision() {
    if (ghostPositions.includes(pacmanPosition) || fastGhostPositions.includes(pacmanPosition) || chasingGhostPosition === pacmanPosition) {
        showLostMessage();
    }
}

function showLostMessage() {
    phase.style.display = 'flex';
    phase.textContent = 'Você perdeu!';
    setTimeout(() => {
        resetToFirstPhase();
        phase.style.display = 'none';
    }, 2000);
}

function checkExit() {
    if (pacmanPosition === exitPosition && coins.length === 0) {
        phase.style.display = 'flex';
        currentPhase++;
        if (currentPhase > 2 && currentPhase % 2 === 1) {
            ghostPositions.push(findEmptyPosition());
        }
        if (currentPhase >= 5 && currentPhase % 2 === 1) {
            fastGhostPositions.push(findEmptyPosition());
        }
        if (currentPhase === 10) {
            chasingGhostPosition = findEmptyPosition();
        }
        phase.textContent = `Fase ${currentPhase}`;
        setTimeout(() => {
            resetGame();
            phase.style.display = 'none';
        }, 2000);
    }
}

function findEmptyPosition() {
    let emptyPos;
    do {
        emptyPos = Math.floor(Math.random() * gridSize * gridSize);
    } while (isPositionOccupied(emptyPos));
    return emptyPos;
}

function resetGame() {
    pacmanPosition = 0;
    obstacles.length = 0;
    coins.length = 0;
    cells.forEach(cell => cell.classList.remove('obstacle', 'coin', 'pacman', 'ghost', 'fast-ghost', 'chasing-ghost'));
    placeObstacles();
    placeCoins();
    cells[exitPosition].classList.add('exit');
    draw();
}

function resetToFirstPhase() {
    currentPhase = 1;
    ghostPositions = [38];
    fastGhostPositions = [];
    chasingGhostPosition = null;
    phase.textContent = `Fase ${currentPhase}`;
    resetGame();
}

function startGame() {
    startScreen.style.display = 'none';
    phase.style.display = 'flex';
    phase.textContent = `Fase ${currentPhase}`;
    setTimeout(() => {
        phase.style.display = 'none';
        document.addEventListener('keydown', movePacman);
        setInterval(moveGhosts, 500);
        setInterval(moveFastGhosts, 300);
        if (currentPhase >= 10) {
            setInterval(moveChasingGhost, 400);
        }
    }, 2000);
}

const startButton = document.getElementById('startButton');
const exitButton = document.getElementById('exitButton');

function startGame() {
    startScreen.style.display = 'none';
    phase.style.display = 'flex';
    phase.textContent = `Fase ${currentPhase}`;
    setTimeout(() => {
        phase.style.display = 'none';
        document.addEventListener('keydown', movePacman);
        setInterval(moveGhosts, 500);
        setInterval(moveFastGhosts, 300);
        if (currentPhase >= 10) {
            setInterval(moveChasingGhost, 400);
        }
    }, 2000);
}

function exitGame() {
    window.location.href = 'index.html'; // Coloque a URL desejada aqui
}

startButton.addEventListener('click', startGame);
exitButton.addEventListener('click', exitGame);

// Inicie o jogo
createGrid();
draw();

// Adicione a lógica de movimento rápido para o fantasma caçador

function moveChasingGhost() {
    if (chasingGhostPosition === null) return;

    const pacmanRow = Math.floor(pacmanPosition / gridSize);
    const pacmanCol = pacmanPosition % gridSize;
    const ghostRow = Math.floor(chasingGhostPosition / gridSize);
    const ghostCol = chasingGhostPosition % gridSize;

    let newPos = chasingGhostPosition;

    if (pacmanRow < ghostRow) {
        newPos -= gridSize;
    } else if (pacmanRow > ghostRow) {
        newPos += gridSize;
    } else if (pacmanCol < ghostCol) {
        newPos -= 1;
    } else if (pacmanCol > ghostCol) {
        newPos += 1;
    }

    if (!obstacles.includes(newPos) && newPos >= 0 && newPos < gridSize * gridSize && Math.abs(newPos % gridSize - chasingGhostPosition % gridSize) <= 1) {
        chasingGhostPosition = newPos;
    }

    checkCollision();
    draw();
}

// No startGame, ajuste o intervalo do movimento do fantasma caçador

function startGame() {
    startScreen.style.display = 'none';
    phase.style.display = 'flex';
    phase.textContent = `Fase ${currentPhase}`;
    setTimeout(() => {
        phase.style.display = 'none';
        document.addEventListener('keydown', movePacman);
        setInterval(moveGhosts, 500);
        setInterval(moveFastGhosts, 300);
        if (currentPhase >= 10) {
            setInterval(moveChasingGhost, 200); // Ajuste aqui para mover mais rápido
        }
    }, 2000);
}