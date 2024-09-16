const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Carregar imagem de fundo
const backgroundImage = new Image();
backgroundImage.src = 'imagens.jogocobrinha/IMG_6811.PNG';  // Substitua com o caminho correto para a imagem de fundo


// Ajuste do canvas para ser responsivo
function resizeCanvas() {
    const scale = Math.min(window.innerWidth / 600, window.innerHeight / 600);
    canvas.width = 600 * scale;
    canvas.height = 600 * scale;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const gridSize = 20;
let snake = [{ x: 160, y: 160 }];
let direction = { x: 0, y: 0 };
let lastDirection = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let speed = 200;  // Velocidade inicial em ms
let gameStarted = false;
let lastRenderTime = 0;

// Carregar imagens da cobra, corpo e maçã
const snakeHeadImage = new Image();
snakeHeadImage.src = 'imagens.jogocobrinha/cabeçacobra.png';  // Cabeça da cobra

const snakeBodyImage = new Image();
snakeBodyImage.src = 'imagens.jogocobrinha/corpocobra.png';  // Corpo da cobra

const foodImage = new Image();
foodImage.src = 'imagens.jogocobrinha/maçã.png';  // Maçã

// Elemento de mensagem de perda
const loseMessageElement = document.getElementById('loseMessage');

// Posição aleatória para a comida (maçã)
function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * canvas.width / gridSize) * gridSize,
        y: Math.floor(Math.random() * canvas.height / gridSize) * gridSize
    };
}

// Função para desenhar a imagem
function drawImage(image, x, y) {
    ctx.drawImage(image, x, y, gridSize, gridSize);
}

// Função principal do jogo
function gameLoop(timestamp) {
    if (!gameStarted) return;

    const deltaTime = timestamp - lastRenderTime;
    if (deltaTime > speed) {
        lastRenderTime = timestamp;

        // Desenhar a imagem de fundo
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        // Move a cobra
        const newHead = {
            x: snake[0].x + direction.x * gridSize,
            y: snake[0].y + direction.y * gridSize
        };
        snake.unshift(newHead);  // Adiciona a nova cabeça no início
        snake.pop();  // Remove a cauda

        // Verifica colisões (paredes ou corpo)
        if (snake[0].x >= canvas.width || snake[0].x < 0 || snake[0].y >= canvas.height || snake[0].y < 0 ||
            snake.slice(1).some(segment => segment.x === snake[0].x && segment.y === snake[0].y)) {
            showLoseMessage();
            resetGame();
            return;
        }

        // Desenha a comida (maçã)
        drawImage(foodImage, food.x, food.y);

        // Verifica se a cobra comeu a comida
        if (snake[0].x === food.x && snake[0].y === food.y) {
            snake.push(snake[snake.length - 1]);  // Adiciona um novo bloco ao final
            score++;
            document.getElementById('score').innerText = score;
            food = getRandomPosition(); // Nova posição para a comida

            // Aumenta a velocidade com base na pontuação
            adjustSpeed();

            // Verifica se o jogador alcançou a pontuação de 40
            if (score >= 40) {
                showWinMessage();
            }
        }

        // Desenha a cabeça da cobra
        drawImage(snakeHeadImage, snake[0].x, snake[0].y);

        // Desenha o corpo da cobra
        for (let i = 1; i < snake.length; i++) {
            drawImage(snakeBodyImage, snake[i].x, snake[i].y);
        }
    }

    requestAnimationFrame(gameLoop);  // Solicita o próximo frame de animação
}

// Função para ajustar a velocidade com base na pontuação
function adjustSpeed() {
    const minSpeed = 50;  // Velocidade mínima (mais rápido)
    const maxSpeed = 200; // Velocidade inicial (mais lento)
    const speedReductionFactor = 10; // Reduzir a velocidade a cada 10 pontos

    // Aumenta a velocidade conforme a pontuação aumenta
    speed = Math.max(minSpeed, maxSpeed - (score * speedReductionFactor));
}

// Função para mostrar a mensagem de vitória
function showWinMessage() {
    document.getElementById('winMessage').classList.remove('d-none');
}

// Função para mostrar a mensagem de derrota
function showLoseMessage() {
    loseMessageElement.classList.remove('d-none');
    setTimeout(() => {
        loseMessageElement.classList.add('d-none');
    }, 5000);  // Oculta a mensagem após 5 segundos
}

// Função para reiniciar o jogo
function restartGame() {
    resetGame();
    startGame();  // Reinicia o jogo após resetar
}

// Função para sair do jogo
function exitGame() {
    resetGame();
    document.getElementById('gameCanvas').classList.add('d-none');  // Oculta o canvas
    document.getElementById('startButton').classList.remove('d-none');  // Mostra o botão de começar
    document.getElementById('restartButton').classList.add('d-none');  // Oculta o botão de reiniciar
    document.getElementById('exitButton').classList.add('d-none');  // Oculta o botão de sair
    document.getElementById('winMessage').classList.add('d-none');  // Oculta a mensagem de vitória
    loseMessageElement.classList.add('d-none');  // Oculta a mensagem de perda
}

// Função para reiniciar o jogo
function resetGame() {
    snake = [{ x: 160, y: 160 }];
    direction = { x: 0, y: 0 };
    lastDirection = { x: 0, y: 0 };
    food = getRandomPosition();
    score = 0;
    speed = 200;  // Reseta a velocidade inicial
    gameStarted = false;
    document.getElementById('score').innerText = score;
    document.getElementById('startButton').classList.remove('d-none');
    document.getElementById('restartButton').classList.add('d-none');
    document.getElementById('exitButton').classList.add('d-none');
    document.getElementById('winMessage').classList.add('d-none');  // Oculta a mensagem de vitória
    loseMessageElement.classList.add('d-none');  // Oculta a mensagem de perda
}

// Função para começar o jogo
function startGame() {
    gameStarted = true;
    document.getElementById('startButton').classList.add('d-none');
    document.getElementById('restartButton').classList.remove('d-none');
    document.getElementById('exitButton').classList.remove('d-none');
    lastRenderTime = performance.now();
    requestAnimationFrame(gameLoop);  // Inicia o loop de animação
}

// Controle de teclas para mover a cobra
window.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    switch (e.key) {
        case 'ArrowUp':
            if (lastDirection.y === 0) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (lastDirection.y === 0) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (lastDirection.x === 0) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (lastDirection.x === 0) direction = { x: 1, y: 0 };
            break;
    }
    lastDirection = { ...direction };
});

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', restartGame);
document.getElementById('exitButton').addEventListener('click', exitGame);

resetGame();
