let startBtn = document.getElementById('start');
let interval;
let resetBtn = document.getElementById('reset');
let images = ['img/hawks_logo.png', 'img/lakers_logo.png', 'img/celtics_logo.png', 'img/spurs_logo.png', 'img/magic_logo.png', 'img/mavericks_logo.png', 'img/warriors_logo.png', 'img/bulls_logo.png', 'img/76ers_logo.png', 'img/thunder_logo.png']
let gameContainer = document.getElementById('game-container');
let cards = [];

startBtn.addEventListener('click', function() {
    startBtn.disabled = true;
    startGame()
});

function startGame() {
    gameContainer.innerHTML = '';

    let boardSize = document.getElementById('board-size').value;
    let pickedImages = pickRandomImages(boardSize);
    let shuffledCards = shuffleCards(pickedImages);
    cards = generateCards(shuffledCards);
    startTimer();
}

function pickRandomImages(boardSize) {
    let randomImages = [];
    let randomIndex;
    while (randomImages.length < boardSize / 2) {
        randomIndex = Math.floor(Math.random() * images.length);
        if (!randomImages.includes(images[randomIndex])) {
            randomImages.push(images[randomIndex]);
        }
    }
    return randomImages;
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
                   <img src="${path}" width="100" >
                </div>
                <div class="card-back">
                    <img src="img/nba-logo.png" alt="Card Back" height="150" >
                </div>
            </div>
        `;
    });
    cards = document.querySelectorAll('.card');
    setTimeout(() => {
        cards.forEach(card => {
            card.classList.remove('flipped');
        });
    }, 3000);
    return cards;
}

resetBtn.addEventListener('click', function() {
    stopTimer();
    gameContainer.innerHTML = '';
});

function stopTimer() {
    let timer = document.getElementById('timer');
    clearInterval(interval);
    startBtn.disabled = false;
    timer.textContent = 0;
}

gameContainer.addEventListener('click', function(event) {
    let clickedCard = event.target.closest('.card');
    if (clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
        return;
    }
    flipCard(clickedCard);
});

function flipCard(card) {
    card.classList.add('flipped');
    let flippedCards = document.querySelectorAll('.flipped');
    if (flippedCards.length === 2) {
        checkMatch(flippedCards);
    }
}

function checkMatch(flippedCards) {
    let firstCard = flippedCards[0];
    let secondCard = flippedCards[1];
    if (firstCard.innerHTML === secondCard.innerHTML) {
        flippedCards.forEach(card => {
            card.classList.add('matched');
            card.classList.remove('flipped');
            card.removeEventListener('click', function() {
                flipCard(card);
            });
            checkGameEnd();
        });
    } else {
        setTimeout(() => {
            flippedCards.forEach(card => {
                card.classList.remove('flipped');
            });
        }, 1000);
    }
}

function checkGameEnd() {
    let matchedCards = document.querySelectorAll('.matched');
    if (matchedCards.length === cards.length) {
        stopTimer();
        setTimeout(() => {
            confetti({
                particleCount: 1000,
                spread: 150,
                origin: { y: 0.6 }
              });
        }, 500);
    }
}