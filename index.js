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
let aiTimeouts = [];

startBtn.addEventListener("click", function () {
    startGame();
});

function startGame() {
    gameContainer.innerHTML = "";
    let boardSize = document.getElementById("board-size").value;
    AIDifficulty = document.getElementById("difficulty").value;
    console.log("AIDifficulty: ", AIDifficulty);
    let pickedImages = pickRandomImages(boardSize);
    let shuffledCards = shuffleCards(pickedImages);
    cards = generateCards(shuffledCards);
    startTimer();
    game(aiTurn);
}

function game(isAiTurn) {
    let gameTimeout = setTimeout(() => {
        let cards = document.querySelectorAll(".card");
        let pickedCards = [];
        if (isAiTurn) {
            gameContainer.style.pointerEvents = "none";
            aiPlay(cards, pickedCards);
        } else {
            gameContainer.style.pointerEvents = "auto";
        }
    }, 500); 
    aiTimeouts.push(gameTimeout);
}

function aiPlay(cards, pickedCards) {
    let memoryContainsPair = checkMemoryForPair(cards, pickedCards);
    let memoryContainsCard = checkMemoryForCard(cards, pickedCards, memoryContainsPair);
    if (!memoryContainsPair) {
        pickedCards.push(pickRandomCard(cards, pickedCards));
        pickedCards.push(pickRandomCard(cards, pickedCards));
    } else if (memoryContainsCard) {
        pickedCards.push(pickRandomCard(cards, pickedCards));
    }
    
    flipCard(pickedCards[0]);
    let flipTimeout = setTimeout(() => {
        flipCard(pickedCards[1]);
    }, 500);
    aiTimeouts.push(flipTimeout);
}

function checkMemoryForPair(cards, pickedCards) {
    let memoryContainsPair = false;
    let memoryKeys = Array.from(iaMemory.keys());
    memoryKeys.forEach((key) => {
        let values = iaMemory.get(key);
        if (values.length === 2) {
            let firstCard = cards[values[0]];
            let secondCard = cards[values[1]];
            if (!firstCard.classList.contains("flipped") && !firstCard.classList.contains("matched")) {
                pickedCards.push(firstCard);
            }
            if (!secondCard.classList.contains("flipped") && !secondCard.classList.contains("matched")) {
                pickedCards.push(secondCard);
            }
            memoryContainsPair = true;
            iaMemory.delete(key);
        }
    });
    return memoryContainsPair;
}

function checkMemoryForCard(cards, pickedCards, memoryContainsPair) {
    let memoryContainsCard = false;
    if (!memoryContainsPair) {
        let memoryKeys = Array.from(iaMemory.keys());
        memoryKeys.forEach((key) => {
            let values = iaMemory.get(key);
            if (values.length === 1) {
                let card = cards[values[0]];
                if (!card.classList.contains("flipped") && !card.classList.contains("matched")) {
                    pickedCards.push(card);
                    memoryContainsCard = true;
                }
            }
        });
    }
    return memoryContainsCard;
}

function pickRandomCard(cards, pickedCards) {
    cards = [...cards].filter((card) => !card.classList.contains("flipped"));
    cards = [...cards].filter((card) => !card.classList.contains("matched"));
    cards = [...cards].filter((card) => pickedCards.indexOf(card) === -1);
    let randomIndex = Math.floor(Math.random() * cards.length);
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
    cards.forEach((card) => {
        card.addEventListener("click", function () {
            if (!aiTurn) {
                flipCard(card);
            }
        });
    });
    return cards;
}

resetBtn.addEventListener("click", function () {
    stopTimer();
    gameContainer.innerHTML = "";
    aiTimeouts.forEach(timeout => clearTimeout(timeout)); // Clear all AI timeouts
    aiTimeouts = []; // Reset the timeouts array
    iaMemory.clear(); // Clear AI memory
    aiTurn = false; // Reset AI turn
    startBtn.disabled = false;
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
    let memoryHasFailed = checkMemoryFailure(AIDifficulty)
    if (!memoryHasFailed) {
        if (iaMemory.has(key) && iaMemory.get(key).length < 2 && iaMemory.get(key)[0] !== value) {
            let values = iaMemory.get(key);
            values.push(value);
            iaMemory.set(key, values);
        } else {
            iaMemory.set(key, [value]);
        }
    }
}

function checkMemoryFailure(difficulty) {
    if (difficulty === "easy") {
        return Math.random() < 0.5;
    } else if (difficulty === "medium") {
        return Math.random() < 0.3;
    } else if (difficulty === "hard") {
        return Math.random() < 0.1;
    }
}

function removeCardsFromMemory(card) {
    let key = card.querySelector("img").alt;
    if (iaMemory.has(key)) {
        iaMemory.delete(key);
    }
}

function checkMatch(flippedCards) {
    let firstCard = flippedCards[0];
    let secondCard = flippedCards[1];
    let gameEnd = false;
    let matchTimeout = setTimeout(() => {
        if (firstCard.innerHTML === secondCard.innerHTML) {
            flippedCards.forEach((card) => {
                removeCardsFromMemory(card);
                card.classList.add("matched");
                card.classList.remove("flipped");
                setTimeout(() => {
                    card.removeEventListener("click", function () {
                        flipCard(card);
                    });
                }, 3000);
            });
            addPlayToGameLog(firstCard, "match", aiTurn ? "AI" : "Human");
            gameEnd = checkGameEnd();
            if (gameEnd) {
                return;
            }
        } else {
            flippedCards.forEach((card) => {
                card.classList.remove("flipped");
            });
        }
        flippedCards = [];
        aiTurn = !aiTurn;
        game(aiTurn);
    }, 1000);
    aiTimeouts.push(matchTimeout);
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
        return true;
    }
    return false;
}
