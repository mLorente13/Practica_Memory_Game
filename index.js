let startBtn = document.getElementById('start');
let interval;
let resetBtn = document.getElementById('reset');
let imgPaths = ['img/hawks_logo.png', 'img/lakers_logo.png', 'img/celtics_logo.png', 'img/spurs_logo.png', 'img/magic_logo.png', 'fa-cube', 'fa-leaf', 'fa-bicycle']
let gameContainer = document.getElementById('game-container');
let cards = document.querySelectorAll('.card');

startBtn.addEventListener('click', function() {
    startBtn.disabled = true;
    startGame()
});

function startGame() {
    let shuffledCards = shuffleCards(imgPaths);
    generateCards(shuffledCards);
    startTimer();
}

function startTimer() {
    let time = 0;
    let timer = document.getElementById('timer');
    interval = setInterval(() => {
        time++;
        timer.textContent = time;
    }, 1000);
}

function shuffleCards(imgPaths) {
    let shuffledCards = [];
    let cardsCopy = [...imgPaths, ...imgPaths];
    while (cardsCopy.length > 0) {
        let randomIndex = Math.floor(Math.random() * cardsCopy.length);
        shuffledCards.push(cardsCopy[randomIndex]);
        cardsCopy.splice(randomIndex, 1);
    }
    return shuffledCards;
}

function generateCards(shuffledCards) {
    shuffledCards.forEach(path => {
        gameContainer.innerHTML += `
            <div class="card flipped">
                <div class="card-front">
                   <img src="${path}" width="150" >
                </div>
                <div class="card-back">
                    <img src="img/nba-logo.png" alt="Card Back" height="250" >
                </div>
            </div>
        `;
    });
    setTimeout(() => {
        let cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.remove('flipped');
        });
    }, 3000);
}

resetBtn.addEventListener('click', function() {
    stopTimer();
    gameContainer.innerHTML = '';
    console.log('Timer stopped');
});

function stopTimer() {
    let timer = document.getElementById('timer');
    clearInterval(interval);
    startBtn.disabled = false;
    timer.textContent = 0;
}

cards.forEach(card => {
    card.addEventListener('click', function() {
        flipCard(card);
    });
});

function flipCard(card) {
    card.classList.add('flipped');
    let flippedCards = document.querySelectorAll('.flipped');
    if (flippedCards.length === 2) {
        checkMatch(flippedCards);
    }
}