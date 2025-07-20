// Game state variables
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    score: 0,
    moves: 0,
    startTime: null,
    timerInterval: null,
    isGameActive: false
};

const logos = [
    '4thdimension.jpg',
    'alturos.jpg',
    'astrabyte.jpg',
    'catalyst.jpg',
    'creators.jpg',
    'nexora.jpg',
    'octacore.jpg',
    'ssnergy_squad.jpg'
];

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

// Initialize game
function initializeGame() {
    createCards();
    renderBoard();
    resetStats();
}

// Create card data
function createCards() {
    gameState.cards = [];
    
    // Create pairs of logos
    for (let i = 0; i < logos.length; i++) {
        gameState.cards.push({
            id: i * 2,
            logo: logos[i],
            isFlipped: false,
            isMatched: false
        });
        gameState.cards.push({
            id: i * 2 + 1,
            logo: logos[i],
            isFlipped: false,
            isMatched: false
        });
    }
    
    // Shuffle cards
    shuffleArray(gameState.cards);
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Render the game board
function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    gameState.cards.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        gameBoard.appendChild(cardElement);
    });
}

// Create individual card element
function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.index = index;
    
    if (card.isFlipped || card.isMatched) {
        cardDiv.classList.add('flipped');
    }
    
    if (card.isMatched) {
        cardDiv.classList.add('matched');
    }
    
    cardDiv.innerHTML = `
        <div class="card-face card-back">?</div>
        <div class="card-face card-front">
            <img src="${card.logo}" alt="Logo" class="logo-image">
        </div>
    `;
    
    cardDiv.addEventListener('click', () => handleCardClick(index));
    
    return cardDiv;
}

// Handle card click
function handleCardClick(index) {
    const card = gameState.cards[index];
    
    // Start timer on first click
    if (!gameState.isGameActive) {
        startTimer();
        gameState.isGameActive = true;
    }
    
    // Check if card can be flipped
    if (card.isFlipped || card.isMatched || gameState.flippedCards.length >= 2) {
        return;
    }
    
    // Flip the card
    flipCard(index);
    
    // Check for matches when two cards are flipped
    if (gameState.flippedCards.length === 2) {
        setTimeout(() => {
            checkForMatch();
        }, 1000);
    }
}

// Flip a card
function flipCard(index) {
    const card = gameState.cards[index];
    const cardElement = document.querySelector(`[data-index="${index}"]`);
    
    card.isFlipped = true;
    cardElement.classList.add('flipped');
    
    gameState.flippedCards.push(index);
}

// Check for match between flipped cards
function checkForMatch() {
    const [firstIndex, secondIndex] = gameState.flippedCards;
    const firstCard = gameState.cards[firstIndex];
    const secondCard = gameState.cards[secondIndex];
    
    gameState.moves++;
    updateMoves();
    
    if (firstCard.logo === secondCard.logo) {
        // Match found
        handleMatch(firstIndex, secondIndex);
    } else {
        // No match
        handleNoMatch(firstIndex, secondIndex);
    }
    
    gameState.flippedCards = [];
}

// Handle successful match
function handleMatch(firstIndex, secondIndex) {
    const firstCard = gameState.cards[firstIndex];
    const secondCard = gameState.cards[secondIndex];
    const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
    const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
    
    firstCard.isMatched = true;
    secondCard.isMatched = true;
    
    firstElement.classList.add('matched');
    secondElement.classList.add('matched');
    
    gameState.matchedPairs++;
    gameState.score += 100;
    
    updateScore();
    
    // Check if game is complete
    if (gameState.matchedPairs === logos.length) {
        setTimeout(() => {
            endGame();
        }, 500);
    }
}

// Handle no match
function handleNoMatch(firstIndex, secondIndex) {
    const firstCard = gameState.cards[firstIndex];
    const secondCard = gameState.cards[secondIndex];
    const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
    const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
    
    firstCard.isFlipped = false;
    secondCard.isFlipped = false;
    
    firstElement.classList.remove('flipped');
    secondElement.classList.remove('flipped');
    
    // Deduct points for wrong match
    gameState.score = Math.max(0, gameState.score - 10);
    updateScore();
}

// Start the game timer
function startTimer() {
    gameState.startTime = Date.now();
    
    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Stop the timer
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// End the game
function endGame() {
    stopTimer();
    gameState.isGameActive = false;
    
    // Calculate bonus points based on moves and time
    const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - gameState.startTime) / 1000));
    const moveBonus = Math.max(0, (16 - gameState.moves) * 10);
    
    gameState.score += timeBonus + moveBonus;
    updateScore();
    
    // Show victory modal
    showVictoryModal();
}

// Show victory modal
function showVictoryModal() {
    const modal = document.getElementById('victoryModal');
    const finalTime = document.getElementById('timer').textContent;
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalMoves').textContent = gameState.moves;
    document.getElementById('finalTime').textContent = finalTime;
    
    modal.classList.add('show');
}

// Close victory modal
function closeModal() {
    const modal = document.getElementById('victoryModal');
    modal.classList.remove('show');
}

// Play again
function playAgain() {
    closeModal();
    startNewGame();
}

// Start new game
function startNewGame() {
    stopTimer();
    gameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        score: 0,
        moves: 0,
        startTime: null,
        timerInterval: null,
        isGameActive: false
    };
    
    createCards();
    renderBoard();
    resetStats();
}

// Reset game (same as new game)
function resetGame() {
    startNewGame();
}

// Reset statistics display
function resetStats() {
    document.getElementById('score').textContent = '0';
    document.getElementById('moves').textContent = '0';
    document.getElementById('timer').textContent = '0:00';
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

// Update moves display
function updateMoves() {
    document.getElementById('moves').textContent = gameState.moves;
}

// Disable all cards temporarily
function disableAllCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.add('disabled'));
}

// Enable all cards
function enableAllCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.remove('disabled'));
}
