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
let keepPlaying;

gameSettings.addEventListener("click", function () {
    if (gameSettingsContainer.open) {
        gameSettingsContainer.close();
    } else {
        gameSettingsContainer.showModal();
    }
});


startBtn.addEventListener("click", function () {
    startGame();
});

closeBtn.addEventListener("click", function () {
    closeSettings();
});

window.addEventListener("keypress", function (e) {
    if (e.key === "Escape") {
        closeSettings();
    }
});

printMatchesScore(humanMatches, aiMatches);

resetBtn.addEventListener("click", function () {
    gameContainer.innerHTML = "";
    resetScores();
    aiTimeouts.forEach(timeout => clearTimeout(timeout));
    aiTimeouts = [];
    iaMemory.clear();
    aiTurn = false;
    startBtn.disabled = false;
});

function closeSettings() {
    gameSettingsContainer.close();
}

function applyGameSettings() {
    boardSize = document.getElementById("board-size").value;
    AIDifficulty = document.getElementById("difficulty").value;
    flipCards = document.getElementById("flip-cards").checked;
    startTurn = document.getElementById("start-turn").checked;
    keepPlaying = document.getElementById("keep-playing").checked;
}

function startGame() {
    applyGameSettings(boardSize, AIDifficulty, flipCards, startTurn);
    gameContainer.innerHTML = "";
    let pickedImages = pickRandomImages(boardSize);
    let shuffledCards = shuffleCards(pickedImages);
    iaMemory.clear();
    cards = generateCards(shuffledCards, flipCards);
    startTimer();
    resetScores();
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
// TODO: Remove cards that are in memory from the cards array
function aiPlay(cards, pickedCards) {
    let memoryContainsPair = checkMemoryForPair(cards, pickedCards);
    let memoryContainsCard = checkMemoryForCard(cards, pickedCards, memoryContainsPair);
    if (memoryContainsCard) {
        pickedCards.push(pickRandomCard(cards, pickedCards, memoryContainsCard));
    } else if (!memoryContainsCard && !memoryContainsPair) {
        pickedCards.push(pickRandomCard(cards, pickedCards, memoryContainsCard));
        pickedCards.push(pickRandomCard(cards, pickedCards, memoryContainsCard));
    }

    flipCard(pickedCards[0]);
    let flipTimeout = setTimeout(() => {
        flipCard(pickedCards[1]);
    }, 500);
    aiTimeouts.push(flipTimeout);
}

function checkMemoryForPair(cards, pickedCards) {
    let memoryKeys = Array.from(iaMemory.keys());
    for (let i = 0; i < memoryKeys.length; i++) {
        let values = iaMemory.get(memoryKeys[i]);
        if (values.length === 2) {
            let card1 = cards[values[0]];
            let card2 = cards[values[1]];
            if (!card1.classList.contains("flipped") && !card1.classList.contains("matched") && !card2.classList.contains("flipped") && !card2.classList.contains("matched")) {
                pickedCards.push(card1);
                pickedCards.push(card2);
                iaMemory.delete(memoryKeys[i]);
                return true;
            }
        }
    }
    return false;
}

function checkMemoryForCard(cards, pickedCards, memoryContainsPair) {
    let memoryContainsCard = false;
    if (!memoryContainsPair) {
        let memoryKeys = Array.from(iaMemory.keys());
        for (let i = 0; i < memoryKeys.length; i++) {
            let values = iaMemory.get(memoryKeys[i]);
            if (values.length === 1) {
                let card = cards[values[0]];
                if (!card.classList.contains("flipped") && !card.classList.contains("matched")) {
                    pickedCards.push(card);
                    return true;
                }
            }
        }
    }
    return memoryContainsCard;
}
// TODO: Fix filter cards remove cards that are not in memory
function pickRandomCard(cards, pickedCards) {
    cards = [...cards].filter((card) => !card.classList.contains("flipped"))
        .filter((card) => !card.classList.contains("matched"))
        .filter((card) => pickedCards.indexOf(card) === -1)
        .filter((card) => !iaMemory.has(card.dataset.position));
    
    let randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
}
// Scoreboard
function startTimer() {
    let timer = document.getElementById("timer"),
        time = "0:00";

    timer.textContent = time;
    clearInterval(interval);
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

function flipCard(card) {
    if (card.classList.contains("flipped") || card.classList.contains("matched")) {
        return;
    }
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
    switch (difficulty) {
        case "easy":
            return Math.random() < 0.5;
        case "medium":
            return Math.random() < 0.3;
        case "hard":
            return false;
    }
    // if (difficulty === "easy") {
    //     return Math.random() < 0.5;
    // } else if (difficulty === "medium") {
    //     return Math.random() < 0.3;
    // } else if (difficulty === "hard") {
    //     return false;
    // }
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
            });
            if (aiTurn) {
                aiPairsFound++;
            } else {
                humanPairsFound++;
            }
            if (!keepPlaying) {
                aiTurn = !aiTurn;
            }
            printPairsScore(humanPairsFound, aiPairsFound);
            addPlayToGameLog(firstCard, aiTurn ? "AI" : "Human");
            gameEnd = checkGameEnd();
            if (gameEnd) {
                return;
            }
        } else {
            flippedCards.forEach((card) => {
                card.classList.remove("flipped");
            });
            aiTurn = !aiTurn;
            (aiTurn);
        }
        flippedCards = [];
        game(aiTurn, gameEnd);
    }, 1000);
    aiTimeouts.push(matchTimeout);
}

function addPlayToGameLog(card, player) {
    let cardAlt = card.querySelector("img").alt;
    let gameLog = document.getElementById("game-log");
    gameLog.textContent += `${timer.textContent}: ${player} found ${cardAlt} pair\n`;
}

function checkGameEnd() {
    let matchedCards = document.querySelectorAll(".matched");
    let humanWin;
    if (matchedCards.length === cards.length) {
        clearInterval(interval);
        if (humanPairsFound > aiPairsFound) {
            localStorage.setItem("humanWins", ++humanMatches);
            humanWin = true;
        } else if (aiPairsFound > humanPairsFound){
            localStorage.setItem("aiWins", ++aiMatches);
        }
        humanPairsFound = 0;
        aiPairsFound = 0;
        printMatchesScore(humanMatches, aiMatches);
        printPairsScore(humanPairsFound, aiPairsFound);
        printGameEndWindow(humanWin);
        return true;
    }
    return false;
}

function printGameEndWindow(humanWin) {
    let gameEndWindow = document.getElementById("game-end");
    let gameEndMessage = document.getElementById("game-end-title");
    let gameTime = document.getElementById("game-time");
    gameTime.textContent = `Time: ${timer.textContent}`;
    let gameEndBtn = document.getElementById("game-end-btn");
    if (humanWin == undefined) {
        gameEndMessage.textContent = "It's a Draw! 🧍‍♂️ 🤝 🤖";
    } else {
        gameEndMessage.textContent = humanWin ? "You Win! 🏆" : "You Lose!";
    }
    gameEndWindow.showModal();
    gameEndBtn.addEventListener("click", function () {
        gameEndWindow.close();
    });
    if (humanWin) {
        confetti({
            particleCount: 1000,
            spread: 350,
            origin: { y: 0.6 },
        });
    }
}
