/**
 * Move History Manager
 * Tracks moves, captured pieces, and provides move quality analysis
 */

class MoveHistory {
    constructor() {
        this.moves = [];
        this.capturedWhite = []; // Pieces captured from white
        this.capturedBlack = []; // Pieces captured from black
        this.lastMove = null;

        // Piece values for display
        this.pieceSymbols = {
            'p': '\u2659', // White pawn
            'n': '\u2658', // White knight
            'b': '\u2657', // White bishop
            'r': '\u2656', // White rook
            'q': '\u2655', // White queen
            'k': '\u2654', // White king
            'P': '\u265F', // Black pawn
            'N': '\u265E', // Black knight
            'B': '\u265D', // Black bishop
            'R': '\u265C', // Black rook
            'Q': '\u265B', // Black queen
            'K': '\u265A'  // Black king
        };

        // Piece values for material calculation
        this.pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
        };
    }

    /**
     * Add a move to history
     * @param {Object} move - Chess.js move object
     * @param {string} san - Move in SAN notation
     * @param {string} color - 'w' or 'b'
     */
    addMove(move, san, color) {
        const moveData = {
            san: san,
            from: move.from,
            to: move.to,
            color: color,
            piece: move.piece,
            captured: move.captured || null,
            promotion: move.promotion || null,
            flags: move.flags,
            quality: null // Will be set later if analyzed
        };

        this.moves.push(moveData);
        this.lastMove = moveData;

        // Track captured pieces
        if (move.captured) {
            if (color === 'w') {
                // White captured a black piece
                this.capturedBlack.push(move.captured);
            } else {
                // Black captured a white piece
                this.capturedWhite.push(move.captured);
            }
            this.sortCaptured();
        }

        return moveData;
    }

    /**
     * Sort captured pieces by value (highest first)
     */
    sortCaptured() {
        const sortFn = (a, b) => this.pieceValues[b] - this.pieceValues[a];
        this.capturedWhite.sort(sortFn);
        this.capturedBlack.sort(sortFn);
    }

    /**
     * Get all moves in standard notation pairs
     * @returns {Array} Array of move pairs { number, white, black }
     */
    getMovePairs() {
        const pairs = [];
        for (let i = 0; i < this.moves.length; i += 2) {
            pairs.push({
                number: Math.floor(i / 2) + 1,
                white: this.moves[i] || null,
                black: this.moves[i + 1] || null
            });
        }
        return pairs;
    }

    /**
     * Get moves as array of SAN strings
     * @returns {string[]}
     */
    getSanMoves() {
        return this.moves.map(m => m.san);
    }

    /**
     * Get the last N moves
     * @param {number} n
     * @returns {Array}
     */
    getLastMoves(n) {
        return this.moves.slice(-n);
    }

    /**
     * Get captured pieces as display strings
     * @returns {Object} { white: string, black: string }
     */
    getCapturedDisplay() {
        const toSymbols = (pieces, isWhite) => {
            return pieces.map(p => {
                const key = isWhite ? p : p.toUpperCase();
                return this.pieceSymbols[key] || p;
            }).join(' ');
        };

        return {
            white: toSymbols(this.capturedWhite, true),
            black: toSymbols(this.capturedBlack, false)
        };
    }

    /**
     * Calculate material advantage
     * @returns {number} Positive = white ahead, negative = black ahead
     */
    getMaterialAdvantage() {
        let whiteAdvantage = 0;

        for (const piece of this.capturedBlack) {
            whiteAdvantage += this.pieceValues[piece.toLowerCase()];
        }
        for (const piece of this.capturedWhite) {
            whiteAdvantage -= this.pieceValues[piece.toLowerCase()];
        }

        return whiteAdvantage;
    }

    /**
     * Set quality rating for a move
     * @param {number} index - Move index
     * @param {string} quality - 'blunder', 'mistake', 'inaccuracy', 'good', 'excellent', 'brilliant'
     */
    setMoveQuality(index, quality) {
        if (this.moves[index]) {
            this.moves[index].quality = quality;
        }
    }

    /**
     * Basic move quality analysis (without engine)
     * This is a simplified heuristic analysis
     * @param {Object} move - Move object
     * @param {Object} chess - Chess.js instance
     * @returns {string|null} Quality rating or null
     */
    analyzeMove(move, chess) {
        // This is a very basic heuristic
        // Real analysis would require engine evaluation

        // Check if it's a capture of higher value piece
        if (move.captured) {
            const pieceValue = this.pieceValues[move.piece];
            const capturedValue = this.pieceValues[move.captured];
            if (capturedValue > pieceValue) {
                return 'good';
            }
        }

        // Promotions are usually good
        if (move.promotion) {
            return 'good';
        }

        // Check/checkmate
        if (move.san.includes('#')) {
            return 'excellent';
        }
        if (move.san.includes('+')) {
            return null; // Check itself isn't necessarily good
        }

        return null;
    }

    /**
     * Get the last move
     * @returns {Object|null}
     */
    getLastMove() {
        return this.lastMove;
    }

    /**
     * Get move count
     * @returns {number}
     */
    getMoveCount() {
        return this.moves.length;
    }

    /**
     * Get full move number (1, 2, 3...)
     * @returns {number}
     */
    getFullMoveNumber() {
        return Math.floor(this.moves.length / 2) + 1;
    }

    /**
     * Clear all history
     */
    reset() {
        this.moves = [];
        this.capturedWhite = [];
        this.capturedBlack = [];
        this.lastMove = null;
    }

    /**
     * Export history as PGN moves string
     * @returns {string}
     */
    toPGN() {
        const pairs = this.getMovePairs();
        return pairs.map(p => {
            let str = `${p.number}.`;
            if (p.white) str += ` ${p.white.san}`;
            if (p.black) str += ` ${p.black.san}`;
            return str;
        }).join(' ');
    }

    /**
     * Create HTML for move history display
     * @returns {string}
     */
    toHTML() {
        const pairs = this.getMovePairs();
        if (pairs.length === 0) {
            return '<div class="no-moves">No moves yet</div>';
        }

        return pairs.map(p => {
            const whiteClass = this.getMoveClass(p.white);
            const blackClass = this.getMoveClass(p.black);
            const isLastWhite = p.white === this.lastMove;
            const isLastBlack = p.black === this.lastMove;

            return `
                <div class="move-row">
                    <span class="move-number">${p.number}.</span>
                    <span class="move ${whiteClass} ${isLastWhite ? 'last-move' : ''}">${p.white ? p.white.san : ''}</span>
                    <span class="move ${blackClass} ${isLastBlack ? 'last-move' : ''}">${p.black ? p.black.san : ''}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Get CSS class for move quality
     * @param {Object} move
     * @returns {string}
     */
    getMoveClass(move) {
        if (!move || !move.quality) return '';
        return move.quality;
    }
}

// Export for use in other modules
window.MoveHistory = MoveHistory;
