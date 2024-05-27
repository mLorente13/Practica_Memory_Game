let startBtn = document.getElementById("start");
let interval;
let resetBtn = document.getElementById("reset");
let images = [
    "img/hawks_logo.png",
    "img/lakers_logo.png",
    "img/celtics_logo.png",
    "img/spurs_logo.png",
    "img/magic_logo.png",
    "img/mavericks_logo.png",
    "img/warriors_logo.png",
    "img/bulls_logo.png",
    "img/76ers_logo.png",
    "img/thunder_logo.png",
];
let gameContainer = document.getElementById("game-container");
let aiTurn = false;
let iaMemory = new Map();

startBtn.addEventListener("click", function () {
    startGame();
});

function startGame() {
    gameContainer.innerHTML = "";
    let boardSize = document.getElementById("board-size").value;
    let pickedImages = pickRandomImages(boardSize);
    let shuffledCards = shuffleCards(pickedImages);
    cards = generateCards(shuffledCards);
    displayCards(cards);
    startTimer();
    game(aiTurn);
}
function displayCards(cards) {
    cards.forEach((card) => {
        card.addEventListener("click", function () {
            flipCard(card);
        });
    });
}

function game(isAiTurn) {
    setTimeout(() => {
        let cards = document.querySelectorAll(".card");
        let pickedCards = [];
        if (isAiTurn) {
            gameContainer.style.pointerEvents = "none";
            aiPlay(cards, pickedCards);
        } else {
            gameContainer.style.pointerEvents = "auto";
        }
    }, 1000); 
}

function aiPlay(cards, pickedCards) {
    pickedCards.push(pickRandomCard(cards));
    pickedCards.push(pickRandomCard(cards));
    flipCard(pickedCards[0]);
    setTimeout(() => {
        flipCard(pickedCards[1]);
    }, 500);
}

function getCardByPosition(cards, position) {
    let card = [...cards].find((card) => card.dataset.position == position);
    return card;
}

function pickRandomCard(cards) {
    let randomIndex = Math.floor(Math.random() * cards.length);
    if (cards[randomIndex].classList.contains("matched") || cards[randomIndex].classList.contains("flipped")) {
        return pickRandomCard(cards);
    }
    return cards[randomIndex];
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
    let timer = document.getElementById("timer");
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
    let index = 0;
    shuffledCards.forEach((path) => {
        let cardAlt = path.split("/")[1].split("_")[0].split(".")[0];
        gameContainer.innerHTML += `
            <div class="card flipped" data-position="${index}">
                <div class="card-front">
                   <img src="${path}" alt="${cardAlt}" width="100" />
                </div>
                <div class="card-back">
                    <img src="img/nba-logo.png" alt="Card Back" height="150" />
                </div>
            </div>
        `;
        index++;
    });
    cards = document.querySelectorAll(".card");
    setTimeout(() => {
        cards.forEach((card) => {
            card.classList.remove("flipped");
        });
    }, 3000);
    return cards;
}

resetBtn.addEventListener("click", function () {
    stopTimer();
    gameContainer.innerHTML = "";
});

function stopTimer() {
    let timer = document.getElementById("timer");
    clearInterval(interval);
    startBtn.disabled = false;
    timer.textContent = 0;
}

function flipCard(card) {
    card.classList.add("flipped");
    let flippedCards = document.querySelectorAll(".flipped");
    if (flippedCards.length === 2) {
        checkMatch(flippedCards);
    }
    saveCardOnMemory(card);
}

function saveCardOnMemory(card) {
    let key = card.querySelector("img").alt;
    let value = card.dataset.position;
    let memoryFail = Math.random() < 0.5;
    if (!memoryFail) {
        if (iaMemory.has(key) && iaMemory.get(key).length < 2) {
            let values = iaMemory.get(key);
            values.push(value);
            iaMemory.set(key, values);
        } else {
            iaMemory.set(key, [value]);
        }
    }
}

function checkMatch(flippedCards) {
    let firstCard = flippedCards[0];
    let secondCard = flippedCards[1];
    setTimeout(() => {
        if (firstCard.innerHTML === secondCard.innerHTML) {
            flippedCards.forEach((card) => {
                card.classList.add("matched");
                card.classList.remove("flipped");
                setTimeout(() => {
                    card.removeEventListener("click", function () {
                        flipCard(card);
                    });
                }, 3000);
            });
            addPlayToGameLog(firstCard, "match", "human");
            checkGameEnd();
        } else {
            flippedCards.forEach((card) => {
                card.classList.remove("flipped");
            });
        }
        flippedCards = [];
        aiTurn = !aiTurn;
        game(aiTurn);
    }, 1000);
}

function addPlayToGameLog(card, play, player) {
    let cardAlt = card.querySelector("img").alt;
    let gameLog = document.getElementById("game-log");
    gameLog.textContent += `player: ${player} found ${cardAlt} pair!\n`;
}

function checkGameEnd() {
    let matchedCards = document.querySelectorAll(".matched");
    if (matchedCards.length === cards.length) {
        stopTimer();
        setTimeout(() => {
            confetti({
                particleCount: 1000,
                spread: 150,
                origin: { y: 0.6 },
            });
        }, 500);
    }
}
