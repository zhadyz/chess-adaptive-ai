/**
 * Chess Application - Main Controller
 * Coordinates all game components
 */

class ChessApp {
    constructor() {
        // Core components
        this.chess = new Chess();
        this.board = null;
        this.engine = new StockfishEngine();
        this.elo = new EloSystem();
        this.openingBook = new OpeningBook();
        this.history = new MoveHistory();

        // Game state
        this.gameInProgress = false;
        this.playerColor = 'w';
        this.isPlayerTurn = true;
        this.currentSkillLevel = 0;
        this.uciMoves = []; // Moves in UCI format for engine

        // UI elements
        this.elements = {};

        // Chart instance
        this.eloChart = null;

        // Bind methods
        this.onDragStart = this.onDragStart.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onSnapEnd = this.onSnapEnd.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        this.cacheElements();
        this.setupEventListeners();
        this.initBoard();
        this.updateUI();
        this.initEloChart();

        // Load engine
        try {
            await this.engine.init();
            this.hideLoading();
            this.startNewGame();
        } catch (error) {
            console.error('Engine init failed:', error);
            this.hideLoading();
            this.showStatus('Engine failed to load. Please refresh the page.', 'error');
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            board: document.getElementById('board'),
            currentElo: document.getElementById('current-elo'),
            eloChange: document.getElementById('elo-change'),
            gamesPlayed: document.getElementById('games-played'),
            wins: document.getElementById('wins'),
            losses: document.getElementById('losses'),
            draws: document.getElementById('draws'),
            highestElo: document.getElementById('highest-elo'),
            aiSkill: document.getElementById('ai-skill'),
            openingName: document.getElementById('opening-name'),
            openingEco: document.getElementById('opening-eco'),
            capturedWhite: document.getElementById('captured-white'),
            capturedBlack: document.getElementById('captured-black'),
            moveHistory: document.getElementById('move-history'),
            gameStatus: document.getElementById('game-status'),
            newGameBtn: document.getElementById('new-game-btn'),
            resignBtn: document.getElementById('resign-btn'),
            flipBtn: document.getElementById('flip-btn'),
            modal: document.getElementById('game-over-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            modalEloChange: document.getElementById('modal-elo-change'),
            modalNewGame: document.getElementById('modal-new-game'),
            loadingOverlay: document.getElementById('loading-overlay'),
            eloChart: document.getElementById('elo-chart')
        };
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.elements.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.elements.resignBtn.addEventListener('click', () => this.resign());
        this.elements.flipBtn.addEventListener('click', () => this.flipBoard());
        this.elements.modalNewGame.addEventListener('click', () => this.closeModalAndNewGame());
    }

    /**
     * Initialize the chess board
     */
    initBoard() {
        const config = {
            draggable: true,
            position: 'start',
            pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
            onDragStart: this.onDragStart,
            onDrop: this.onDrop,
            onSnapEnd: this.onSnapEnd
        };

        this.board = Chessboard('board', config);

        // Make board responsive
        window.addEventListener('resize', () => this.board.resize());
    }

    /**
     * Initialize the Elo chart
     */
    initEloChart() {
        const ctx = this.elements.eloChart.getContext('2d');
        const history = this.elo.getHistory();

        const labels = history.map((h, i) => i === 0 ? 'Start' : `Game ${h.game}`);
        const data = history.map(h => h.elo);

        this.eloChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Elo Rating',
                    data: data,
                    borderColor: '#e94560',
                    backgroundColor: 'rgba(233, 69, 96, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointBackgroundColor: '#e94560'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#aaa'
                        }
                    }
                }
            }
        });
    }

    /**
     * Update the Elo chart with new data
     */
    updateEloChart() {
        const history = this.elo.getHistory();
        const labels = history.map((h, i) => i === 0 ? 'Start' : `G${h.game}`);
        const data = history.map(h => h.elo);

        this.eloChart.data.labels = labels;
        this.eloChart.data.datasets[0].data = data;
        this.eloChart.update();
    }

    /**
     * Handle drag start
     */
    onDragStart(source, piece, position, orientation) {
        // Don't allow moves if game is over
        if (this.chess.game_over()) return false;

        // Don't allow picking up opponent's pieces
        if (!this.isPlayerTurn) return false;

        // Only pick up player's pieces
        if ((this.playerColor === 'w' && piece.search(/^b/) !== -1) ||
            (this.playerColor === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }

        return true;
    }

    /**
     * Handle piece drop
     */
    onDrop(source, target) {
        // Check for promotion
        const piece = this.chess.get(source);
        let promotion = undefined;

        if (piece && piece.type === 'p') {
            const targetRank = target[1];
            if ((piece.color === 'w' && targetRank === '8') ||
                (piece.color === 'b' && targetRank === '1')) {
                promotion = 'q'; // Auto-promote to queen
            }
        }

        // Try to make the move
        const move = this.chess.move({
            from: source,
            to: target,
            promotion: promotion
        });

        // Illegal move
        if (move === null) return 'snapback';

        // Record the move
        this.recordMove(move);

        // Check game state
        if (this.checkGameOver()) return;

        // AI's turn
        this.isPlayerTurn = false;
        this.showStatus('AI is thinking...');

        setTimeout(() => this.makeAIMove(), 250);
    }

    /**
     * Update board position after animation
     */
    onSnapEnd() {
        this.board.position(this.chess.fen());
    }

    /**
     * Record a move in history
     */
    recordMove(move) {
        const color = move.color;
        this.history.addMove(move, move.san, color);

        // Add to UCI moves list
        const uciMove = move.from + move.to + (move.promotion || '');
        this.uciMoves.push(uciMove);

        // Update UI
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updateOpening();
        this.highlightLastMove(move);
    }

    /**
     * Make the AI move
     */
    async makeAIMove() {
        if (this.chess.game_over() || this.isPlayerTurn) return;

        try {
            const result = await this.engine.getBestMove('startpos', this.uciMoves);
            const parsed = this.engine.parseUCIMove(result.bestMove);

            const move = this.chess.move({
                from: parsed.from,
                to: parsed.to,
                promotion: parsed.promotion
            });

            if (move) {
                this.recordMove(move);
                this.board.position(this.chess.fen());
            }

            if (!this.checkGameOver()) {
                this.isPlayerTurn = true;
                this.showStatus('Your turn');
            }
        } catch (error) {
            console.error('AI move error:', error);
            this.showStatus('AI error - please try again');
            this.isPlayerTurn = true;
        }
    }

    /**
     * Check if game is over
     */
    checkGameOver() {
        if (this.chess.game_over()) {
            this.gameInProgress = false;
            let result, title, message;

            if (this.chess.in_checkmate()) {
                if (this.chess.turn() === this.playerColor) {
                    result = 'loss';
                    title = 'Checkmate!';
                    message = 'The AI wins. Better luck next time!';
                } else {
                    result = 'win';
                    title = 'Checkmate!';
                    message = 'Congratulations! You win!';
                }
            } else if (this.chess.in_stalemate()) {
                result = 'draw';
                title = 'Stalemate';
                message = 'The game is a draw by stalemate.';
            } else if (this.chess.in_threefold_repetition()) {
                result = 'draw';
                title = 'Draw';
                message = 'The game is a draw by threefold repetition.';
            } else if (this.chess.insufficient_material()) {
                result = 'draw';
                title = 'Draw';
                message = 'The game is a draw due to insufficient material.';
            } else if (this.chess.in_draw()) {
                result = 'draw';
                title = 'Draw';
                message = 'The game is a draw.';
            }

            this.endGame(result, title, message);
            return true;
        }

        if (this.chess.in_check()) {
            this.showStatus('Check!', 'warning');
        }

        return false;
    }

    /**
     * End the game and update Elo
     */
    endGame(result, title, message) {
        const eloResult = this.elo.recordGame(result, this.currentSkillLevel);

        this.showModal(title, message, eloResult.change);
        this.updateUI();
        this.updateEloChart();
    }

    /**
     * Start a new game
     */
    startNewGame() {
        // Reset chess instance
        this.chess.reset();

        // Reset history
        this.history.reset();
        this.uciMoves = [];
        this.openingBook.reset();

        // Reset engine
        this.engine.newGame();

        // Set skill level based on player Elo
        this.currentSkillLevel = this.elo.getCurrentSkillLevel();
        this.engine.setSkillLevel(this.currentSkillLevel);

        // Reset board
        this.board.position('start');
        this.clearHighlights();

        // Reset game state
        this.gameInProgress = true;
        this.playerColor = 'w';
        this.isPlayerTurn = true;

        // Update UI
        this.updateUI();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updateOpening();
        this.showStatus('Your turn - you play as White');

        // Hide modal if open
        this.hideModal();
    }

    /**
     * Resign the current game
     */
    resign() {
        if (!this.gameInProgress) return;

        if (confirm('Are you sure you want to resign?')) {
            this.endGame('loss', 'You Resigned', 'The AI wins by resignation.');
        }
    }

    /**
     * Flip the board orientation
     */
    flipBoard() {
        this.board.flip();
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        const stats = this.elo.getStats();

        this.elements.currentElo.textContent = stats.currentElo;
        this.elements.gamesPlayed.textContent = stats.total;
        this.elements.wins.textContent = stats.wins;
        this.elements.losses.textContent = stats.losses;
        this.elements.draws.textContent = stats.draws;
        this.elements.highestElo.textContent = stats.highestElo;
        this.elements.aiSkill.textContent = stats.skillLevel;
    }

    /**
     * Update move history display
     */
    updateMoveHistory() {
        this.elements.moveHistory.innerHTML = this.history.toHTML();
        // Scroll to bottom
        this.elements.moveHistory.scrollTop = this.elements.moveHistory.scrollHeight;
    }

    /**
     * Update captured pieces display
     */
    updateCapturedPieces() {
        const captured = this.history.getCapturedDisplay();
        this.elements.capturedWhite.textContent = captured.white;
        this.elements.capturedBlack.textContent = captured.black;
    }

    /**
     * Update opening display
     */
    updateOpening() {
        const sanMoves = this.history.getSanMoves();
        const opening = this.openingBook.findOpening(sanMoves);

        this.elements.openingName.textContent = opening.name;
        this.elements.openingEco.textContent = opening.eco;
    }

    /**
     * Highlight the last move on the board
     */
    highlightLastMove(move) {
        this.clearHighlights();

        const fromSquare = document.querySelector(`.square-${move.from}`);
        const toSquare = document.querySelector(`.square-${move.to}`);

        if (fromSquare) fromSquare.classList.add('highlight-square');
        if (toSquare) toSquare.classList.add('highlight-square');
    }

    /**
     * Clear all square highlights
     */
    clearHighlights() {
        document.querySelectorAll('.highlight-square').forEach(sq => {
            sq.classList.remove('highlight-square');
        });
    }

    /**
     * Show status message
     */
    showStatus(message, type = '') {
        this.elements.gameStatus.textContent = message;
        this.elements.gameStatus.className = 'game-status ' + type;
    }

    /**
     * Show game over modal
     */
    showModal(title, message, eloChange) {
        this.elements.modalTitle.textContent = title;
        this.elements.modalMessage.textContent = message;

        const changeText = eloChange >= 0 ? `+${eloChange}` : `${eloChange}`;
        this.elements.modalEloChange.textContent = changeText;
        this.elements.modalEloChange.className = eloChange >= 0 ? 'positive' : 'negative';

        // Also show in header
        this.elements.eloChange.textContent = changeText;
        this.elements.eloChange.className = 'elo-change ' + (eloChange >= 0 ? 'positive' : 'negative');

        this.elements.modal.classList.remove('hidden');
    }

    /**
     * Hide the modal
     */
    hideModal() {
        this.elements.modal.classList.add('hidden');
    }

    /**
     * Close modal and start new game
     */
    closeModalAndNewGame() {
        this.hideModal();
        this.startNewGame();
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChessApp();
    window.app.init();
});
