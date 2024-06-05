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
let humanPairsFound = 0;
let aiPairsFound = 0;
let humanMatches = localStorage.getItem("humanWins") || 0;
let aiMatches = localStorage.getItem("aiWins") || 0;
let gameEnd = false;
let gameSettings = document.getElementById("game-settings-btn");
let gameSettingsContainer = document.getElementById("game-settings");
let closeBtn = document.getElementById("close-settings");
let AIDifficulty;
let boardSize;
let flipCards;
let startTurn;

gameSettings.addEventListener("click", function () {
    if (gameSettingsContainer.open) {
        gameSettingsContainer.close();
    } else {
        gameSettingsContainer.showModal();
    }
});

closeBtn.addEventListener("click", function () {
    closeSettings();
});

window.addEventListener("keypress", function (e) {
    if (e.key === "Escape") {
        closeSettings();
    }
});

function closeSettings() {
    gameSettingsContainer.close();
}

function applyGameSettings() {
    boardSize = document.getElementById("board-size").value;
    AIDifficulty = document.getElementById("difficulty").value;
    flipCards = document.getElementById("flip-cards").checked;
    startTurn = document.getElementById("start-turn").checked;
    console.log(boardSize, AIDifficulty, flipCards, startTurn);
}

printMatchesScore(humanMatches, aiMatches);

startBtn.addEventListener("click", function () {
    startGame();
});

function startGame() {
    applyGameSettings(boardSize, AIDifficulty, flipCards, startTurn);
    gameContainer.innerHTML = "";
    console.log(boardSize);
    let pickedImages = pickRandomImages(boardSize);
    let shuffledCards = shuffleCards(pickedImages);
    iaMemory.clear();
    cards = generateCards(shuffledCards, flipCards);
    stopTimer();
    startTimer();
    aiTurn = document.getElementById("start-turn").checked;
    gameEnd = false;
    if (flipCards) {
        setTimeout(() => {
            cards.forEach((card) => {
                card.classList.remove("flipped");
            });
            startGameHelper(aiTurn, gameEnd);
        }, 3000);
    } else {
        startGameHelper(aiTurn, gameEnd);
    }
}

function startGameHelper(aiTurn, gameEnd) {
    game(aiTurn, gameEnd);
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

function generateCards(shuffledCards, showCards) {
    let index = 0;
    shuffledCards.forEach((path) => {
        let cardAlt = path.split("/")[1].split("_")[0].split(".")[0];
        gameContainer.innerHTML += `
            <div class="card${showCards ? " flipped" : ""}" data-position="${index}">
                <div class="card-front">
                   <img class="card-img" src="${path}" alt="${cardAlt}" />
                </div>
                <div class="card-back">
                    <img src="img/nba-logo.png" alt="Card Back" height="125" />
                </div>
            </div>
        `;
        index++;
    });
    cards = document.querySelectorAll(".card");
    if (showCards) {
        setTimeout(() => {
        cards.forEach((card) => {
            card.classList.remove("flipped");
        });
        }, 3000);
    }
    cards.forEach((card) => {
        card.addEventListener("click", function () {
            flipCard(card);
        });
    });
    return cards;
}

function game(isAiTurn, gameEnd) {
    if (gameEnd) {
        return;
    }
    cards.forEach((card) => {
        card.style.pointerEvents = isAiTurn ? "none" : "auto";
    });
    let gameTimeout = setTimeout(() => {
    if (isAiTurn) {
        let cards = document.querySelectorAll(".card");
        let pickedCards = [];
            aiPlay(cards, pickedCards);
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
// Scoreboard
function startTimer() {
    let time = "0:00";
    let timer = document.getElementById("timer");
    interval = setInterval(() => {
        let minutes = parseInt(time.split(":")[0]);
        let seconds = parseInt(time.split(":")[1]);
        seconds++;
        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }
        time = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        timer.textContent = time;
    }, 1000);
}

function stopTimer() {
    let timer = document.getElementById("timer");
    clearInterval(interval);
    startBtn.disabled = false;
    timer.textContent = "0:00";
}

function resetScores() {
    humanPairsFound = 0;
    aiPairsFound = 0;
    printPairsScore(humanPairsFound, aiPairsFound);
    let gameLog = document.getElementById("game-log");
    gameLog.textContent = "";
}

function printPairsScore(humanPairsFound, aiPairsFound) {
    let humanScore = document.getElementById("human-score");
    let aiScore = document.getElementById("ai-score");
    humanScore.textContent = humanPairsFound;
    aiScore.textContent = aiPairsFound;
}

function printMatchesScore(humanMatches, aiMatches) {
    let humanMatchesScore = document.getElementById("human-matches");
    let aiMatchesScore = document.getElementById("ai-matches");
    humanMatchesScore.textContent = humanMatches;
    aiMatchesScore.textContent = aiMatches;
}

resetBtn.addEventListener("click", function () {
    stopTimer();
    gameContainer.innerHTML = "";
    aiTimeouts.forEach(timeout => clearTimeout(timeout));
    stopTimer();
    aiTimeouts = [];
    iaMemory.clear();
    aiTurn = false;
    startBtn.disabled = false;
});

function flipCard(card) {
    card.classList.add("flipped");
    let flippedCards = document.querySelectorAll(".flipped");
    if (flippedCards.length === 2) {
        removeEventListeners();
        checkMatch(flippedCards);
    }
    saveCardOnMemory(card);
}

function removeEventListeners() {
    cards.forEach((card) => {
        card.style.pointerEvents = "none";
    });
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
        return false;
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
            if (aiTurn) {
                aiPairsFound++;
            } else {
                humanPairsFound++;
            }
            printPairsScore(humanPairsFound, aiPairsFound);
            addPlayToGameLog(firstCard, "match", aiTurn ? "AI" : "Human");
            gameEnd = checkGameEnd();
            if (gameEnd) {
                return;
            }
        } else {
            flippedCards.forEach((card) => {
                card.classList.remove("flipped");
            });
            aiTurn = !aiTurn;
        }
        flippedCards = [];
        game(aiTurn, gameEnd);
    }, 1000);
    aiTimeouts.push(matchTimeout);
}

function addPlayToGameLog(card, play, player) {
    let cardAlt = card.querySelector("img").alt;
    let gameLog = document.getElementById("game-log");
    gameLog.textContent += `${player} played ${play} with ${cardAlt}\n`;
}

function checkGameEnd() {
    let matchedCards = document.querySelectorAll(".matched");
    if (matchedCards.length === cards.length) {
        if (humanPairsFound > aiPairsFound) {
            localStorage.setItem("humanWins", ++humanMatches);
        } else if (aiPairsFound > humanPairsFound){
            localStorage.setItem("aiWins", ++aiMatches);
        }
        humanPairsFound = 0;
        aiPairsFound = 0;
        printMatchesScore(humanMatches, aiMatches);
        printPairsScore(humanPairsFound, aiPairsFound);
        stopTimer();
        confetti({
            particleCount: 1000,
            spread: 150,
            origin: { y: 0.6 },
        });
        return true;
    }
    return false;
}
