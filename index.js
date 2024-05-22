let startBtn = document.getElementById('start');
let interval;
let resetBtn = document.getElementById('reset');
let cards = ['fa-heart', 'fa-diamond', 'fa-paper-plane', 'fa-anchor', 'fa-bolt', 'fa-cube', 'fa-leaf', 'fa-bicycle']

startBtn.addEventListener('click', function() {
    startBtn.disabled = true;
    startGame()
});

function startGame() {
    let shuffledCards = shuffleCards(cards);
    generateCards(shuffledCards);
    console.log(shuffledCards);
}

function startTimer() {
    let time = 0;
    let timer = document.getElementById('timer');
    interval = setInterval(() => {
        time++;
        timer.textContent = time;
        console.log(time);
    }, 1000);
}

function shuffleCards(cards) {
    let shuffledCards = [];
    let cardsCopy = cards.slice();
    while (cardsCopy.length > 0) {
        let randomIndex = Math.floor(Math.random() * cardsCopy.length);
        shuffledCards.push(cardsCopy[randomIndex]);
        cardsCopy.splice(randomIndex, 1);
    }
    return shuffledCards;
}

function generateCards(shuffledCards) {
    let gameContainer = document.getElementById('game-container');

    shuffledCards.forEach(card => {
        let cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.innerHTML = `<i class="fa ${card}"></i>`;
        gameContainer.appendChild(cardElement);
    });
}

resetBtn.addEventListener('click', function() {
    stopTimer();
    console.log('Timer stopped');
});

function stopTimer() {
    let timer = document.getElementById('timer');
    clearInterval(interval);
    startBtn.disabled = false;
    timer.textContent = 0;
}