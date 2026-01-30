/**
 * Stockfish Engine Wrapper
 * Handles communication with Stockfish WASM via Web Worker
 */

class StockfishEngine {
    constructor() {
        this.worker = null;
        this.isReady = false;
        this.isSearching = false;
        this.skillLevel = 0;
        this.moveTime = 1000; // ms to think
        this.currentResolve = null;
        this.onReady = null;
        this.debug = false;
    }

    /**
     * Initialize the Stockfish engine
     * @returns {Promise} Resolves when engine is ready
     */
    async init() {
        return new Promise((resolve, reject) => {
            try {
                // Use Stockfish.js from CDN
                this.worker = new Worker(
                    'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js'
                );

                this.worker.onmessage = (e) => this.handleMessage(e.data);
                this.worker.onerror = (e) => {
                    console.error('Stockfish worker error:', e);
                    reject(e);
                };

                this.onReady = resolve;

                // Initialize UCI
                this.send('uci');
            } catch (error) {
                console.error('Failed to initialize Stockfish:', error);
                reject(error);
            }
        });
    }

    /**
     * Send a command to Stockfish
     * @param {string} cmd - UCI command
     */
    send(cmd) {
        if (this.debug) console.log('>> ' + cmd);
        if (this.worker) {
            this.worker.postMessage(cmd);
        }
    }

    /**
     * Handle messages from Stockfish
     * @param {string} message
     */
    handleMessage(message) {
        if (this.debug) console.log('<< ' + message);

        if (message === 'uciok') {
            // Engine is ready for UCI commands
            this.send('isready');
        } else if (message === 'readyok') {
            // Engine is fully ready
            this.isReady = true;
            if (this.onReady) {
                this.onReady();
                this.onReady = null;
            }
        } else if (message.startsWith('bestmove')) {
            // Parse best move
            const parts = message.split(' ');
            const bestMove = parts[1];
            const ponderMove = parts[3] || null;

            this.isSearching = false;

            if (this.currentResolve) {
                this.currentResolve({
                    bestMove: bestMove,
                    ponder: ponderMove
                });
                this.currentResolve = null;
            }
        } else if (message.startsWith('info')) {
            // Could parse evaluation info here if needed
            // info depth 10 score cp 35 nodes 12345 ...
        }
    }

    /**
     * Set the skill level (0-20)
     * Lower skill = weaker play with more random moves
     * @param {number} level - 0 to 20
     */
    setSkillLevel(level) {
        this.skillLevel = Math.max(0, Math.min(20, level));

        // Set Stockfish skill level option
        this.send(`setoption name Skill Level value ${this.skillLevel}`);

        // Also adjust search depth and move overhead for variety
        // Lower skill levels should think less and make more mistakes
        if (this.skillLevel <= 5) {
            this.moveTime = 500;
        } else if (this.skillLevel <= 10) {
            this.moveTime = 750;
        } else if (this.skillLevel <= 15) {
            this.moveTime = 1000;
        } else {
            this.moveTime = 1500;
        }
    }

    /**
     * Set the position from FEN or moves
     * @param {string} fen - FEN string (optional, defaults to starting position)
     * @param {string[]} moves - Array of moves in UCI format (optional)
     */
    setPosition(fen = 'startpos', moves = []) {
        let cmd = 'position ';
        if (fen === 'startpos') {
            cmd += 'startpos';
        } else {
            cmd += `fen ${fen}`;
        }

        if (moves && moves.length > 0) {
            cmd += ' moves ' + moves.join(' ');
        }

        this.send(cmd);
    }

    /**
     * Get the best move for the current position
     * @param {string} fen - Current position FEN
     * @param {string[]} moves - Moves played (in UCI format)
     * @returns {Promise<Object>} { bestMove, ponder }
     */
    async getBestMove(fen = 'startpos', moves = []) {
        if (!this.isReady) {
            throw new Error('Engine not ready');
        }

        if (this.isSearching) {
            // Stop current search
            this.send('stop');
            await new Promise(r => setTimeout(r, 100));
        }

        return new Promise((resolve) => {
            this.currentResolve = resolve;
            this.isSearching = true;

            // Set position
            this.setPosition(fen, moves);

            // Search with time limit
            // At lower skill levels, also limit depth for more variety
            let searchCmd = `go movetime ${this.moveTime}`;

            if (this.skillLevel <= 3) {
                searchCmd = `go depth ${this.skillLevel + 1} movetime ${this.moveTime}`;
            } else if (this.skillLevel <= 10) {
                searchCmd = `go depth ${Math.floor(this.skillLevel / 2) + 3} movetime ${this.moveTime}`;
            }

            this.send(searchCmd);
        });
    }

    /**
     * Convert UCI move to from/to squares
     * @param {string} uciMove - Move in UCI format (e.g., "e2e4", "e7e8q")
     * @returns {Object} { from, to, promotion }
     */
    parseUCIMove(uciMove) {
        return {
            from: uciMove.substring(0, 2),
            to: uciMove.substring(2, 4),
            promotion: uciMove.length > 4 ? uciMove[4] : undefined
        };
    }

    /**
     * Convert from/to move to UCI format
     * @param {string} from - From square
     * @param {string} to - To square
     * @param {string} promotion - Promotion piece (optional)
     * @returns {string} UCI format move
     */
    toUCI(from, to, promotion = '') {
        return from + to + promotion;
    }

    /**
     * Stop the current search
     */
    stop() {
        if (this.isSearching) {
            this.send('stop');
            this.isSearching = false;
        }
    }

    /**
     * Start a new game
     */
    newGame() {
        this.send('ucinewgame');
        this.send('isready');
    }

    /**
     * Get the current skill level
     * @returns {number}
     */
    getSkillLevel() {
        return this.skillLevel;
    }

    /**
     * Destroy the engine
     */
    destroy() {
        if (this.worker) {
            this.send('quit');
            this.worker.terminate();
            this.worker = null;
        }
        this.isReady = false;
    }
}

// Export for use in other modules
window.StockfishEngine = StockfishEngine;
