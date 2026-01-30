/**
 * Opening Book - Common chess openings with ECO codes
 * Format: { moves: "e4 e5 Nf3...", name: "Opening Name", eco: "C00" }
 */

const OPENINGS = [
    // Open Games (1. e4 e5)
    { moves: "e4 e5 Nf3 Nc6 Bb5", name: "Ruy Lopez", eco: "C60" },
    { moves: "e4 e5 Nf3 Nc6 Bb5 a6", name: "Ruy Lopez: Morphy Defense", eco: "C78" },
    { moves: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O", name: "Ruy Lopez: Closed", eco: "C84" },
    { moves: "e4 e5 Nf3 Nc6 Bc4", name: "Italian Game", eco: "C50" },
    { moves: "e4 e5 Nf3 Nc6 Bc4 Bc5", name: "Giuoco Piano", eco: "C53" },
    { moves: "e4 e5 Nf3 Nc6 Bc4 Nf6", name: "Two Knights Defense", eco: "C55" },
    { moves: "e4 e5 Nf3 Nc6 d4", name: "Scotch Game", eco: "C45" },
    { moves: "e4 e5 Nf3 Nc6 d4 exd4 Nxd4", name: "Scotch Game: Classical", eco: "C45" },
    { moves: "e4 e5 Nf3 Nf6", name: "Petrov's Defense", eco: "C42" },
    { moves: "e4 e5 Nf3 d6", name: "Philidor Defense", eco: "C41" },
    { moves: "e4 e5 Nc3", name: "Vienna Game", eco: "C25" },
    { moves: "e4 e5 f4", name: "King's Gambit", eco: "C30" },
    { moves: "e4 e5 f4 exf4", name: "King's Gambit Accepted", eco: "C33" },
    { moves: "e4 e5 d4", name: "Center Game", eco: "C21" },
    { moves: "e4 e5 Bc4", name: "Bishop's Opening", eco: "C23" },

    // Sicilian Defense
    { moves: "e4 c5", name: "Sicilian Defense", eco: "B20" },
    { moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3", name: "Sicilian: Open", eco: "B50" },
    { moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6", name: "Sicilian: Najdorf", eco: "B90" },
    { moves: "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6", name: "Sicilian: Dragon", eco: "B70" },
    { moves: "e4 c5 Nf3 Nc6", name: "Sicilian: Old Sicilian", eco: "B30" },
    { moves: "e4 c5 Nf3 e6", name: "Sicilian: French Variation", eco: "B40" },
    { moves: "e4 c5 Nc3", name: "Sicilian: Closed", eco: "B23" },
    { moves: "e4 c5 c3", name: "Sicilian: Alapin", eco: "B22" },
    { moves: "e4 c5 d4 cxd4 c3", name: "Sicilian: Smith-Morra Gambit", eco: "B21" },

    // French Defense
    { moves: "e4 e6", name: "French Defense", eco: "C00" },
    { moves: "e4 e6 d4 d5", name: "French Defense: Normal", eco: "C00" },
    { moves: "e4 e6 d4 d5 Nc3", name: "French: Paulsen", eco: "C10" },
    { moves: "e4 e6 d4 d5 Nc3 Nf6", name: "French: Classical", eco: "C11" },
    { moves: "e4 e6 d4 d5 Nc3 Bb4", name: "French: Winawer", eco: "C15" },
    { moves: "e4 e6 d4 d5 Nd2", name: "French: Tarrasch", eco: "C03" },
    { moves: "e4 e6 d4 d5 e5", name: "French: Advance", eco: "C02" },
    { moves: "e4 e6 d4 d5 exd5 exd5", name: "French: Exchange", eco: "C01" },

    // Caro-Kann Defense
    { moves: "e4 c6", name: "Caro-Kann Defense", eco: "B10" },
    { moves: "e4 c6 d4 d5", name: "Caro-Kann: Main Line", eco: "B12" },
    { moves: "e4 c6 d4 d5 Nc3 dxe4 Nxe4", name: "Caro-Kann: Classical", eco: "B18" },
    { moves: "e4 c6 d4 d5 e5", name: "Caro-Kann: Advance", eco: "B12" },
    { moves: "e4 c6 d4 d5 exd5 cxd5", name: "Caro-Kann: Exchange", eco: "B13" },

    // Scandinavian Defense
    { moves: "e4 d5", name: "Scandinavian Defense", eco: "B01" },
    { moves: "e4 d5 exd5 Qxd5", name: "Scandinavian: Main Line", eco: "B01" },
    { moves: "e4 d5 exd5 Nf6", name: "Scandinavian: Modern", eco: "B01" },

    // Pirc/Modern
    { moves: "e4 d6", name: "Pirc Defense", eco: "B07" },
    { moves: "e4 d6 d4 Nf6 Nc3 g6", name: "Pirc: Classical", eco: "B08" },
    { moves: "e4 g6", name: "Modern Defense", eco: "B06" },

    // Alekhine's Defense
    { moves: "e4 Nf6", name: "Alekhine's Defense", eco: "B02" },

    // Queen's Pawn Openings
    { moves: "d4 d5", name: "Queen's Pawn Game", eco: "D00" },
    { moves: "d4 d5 c4", name: "Queen's Gambit", eco: "D06" },
    { moves: "d4 d5 c4 dxc4", name: "Queen's Gambit Accepted", eco: "D20" },
    { moves: "d4 d5 c4 e6", name: "Queen's Gambit Declined", eco: "D30" },
    { moves: "d4 d5 c4 c6", name: "Slav Defense", eco: "D10" },
    { moves: "d4 d5 c4 c6 Nf3 Nf6 Nc3 e6", name: "Semi-Slav", eco: "D43" },
    { moves: "d4 d5 Nf3 Nf6 c4 c6", name: "Slav: Exchange", eco: "D13" },

    // Indian Defenses
    { moves: "d4 Nf6", name: "Indian Defense", eco: "A45" },
    { moves: "d4 Nf6 c4 g6", name: "King's Indian Defense", eco: "E60" },
    { moves: "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6", name: "King's Indian: Classical", eco: "E90" },
    { moves: "d4 Nf6 c4 e6 Nc3 Bb4", name: "Nimzo-Indian Defense", eco: "E20" },
    { moves: "d4 Nf6 c4 e6 Nf3 b6", name: "Queen's Indian Defense", eco: "E12" },
    { moves: "d4 Nf6 c4 e6 g3", name: "Catalan Opening", eco: "E01" },
    { moves: "d4 Nf6 c4 c5 d5 b5", name: "Benko Gambit", eco: "A57" },
    { moves: "d4 Nf6 c4 c5 d5 e6", name: "Benoni Defense", eco: "A60" },
    { moves: "d4 Nf6 Bg5", name: "Trompowsky Attack", eco: "A45" },
    { moves: "d4 Nf6 Nf3 g6 Bf4", name: "London System", eco: "D02" },
    { moves: "d4 d5 Bf4", name: "London System", eco: "D00" },

    // Flank Openings
    { moves: "c4", name: "English Opening", eco: "A10" },
    { moves: "c4 e5", name: "English: Reversed Sicilian", eco: "A20" },
    { moves: "c4 c5", name: "English: Symmetrical", eco: "A30" },
    { moves: "c4 Nf6", name: "English: Anglo-Indian", eco: "A15" },
    { moves: "Nf3", name: "Reti Opening", eco: "A04" },
    { moves: "Nf3 d5 c4", name: "Reti: Main Line", eco: "A09" },
    { moves: "g3", name: "Hungarian Opening", eco: "A00" },
    { moves: "b3", name: "Larsen's Opening", eco: "A01" },
    { moves: "f4", name: "Bird's Opening", eco: "A02" },

    // Dutch Defense
    { moves: "d4 f5", name: "Dutch Defense", eco: "A80" },
    { moves: "d4 f5 c4 Nf6 g3 e6 Bg2", name: "Dutch: Stonewall", eco: "A90" },

    // Other common lines
    { moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3", name: "Italian: Giuoco Pianissimo", eco: "C53" },
    { moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 b4", name: "Italian: Evans Gambit", eco: "C51" },
    { moves: "d4 d5 c4 e6 Nc3 Nf6", name: "QGD: Orthodox", eco: "D60" },
];

/**
 * Opening book manager
 */
class OpeningBook {
    constructor() {
        this.openings = OPENINGS;
        this.currentOpening = null;
    }

    /**
     * Find the opening that matches the current move sequence
     * @param {string[]} moves - Array of moves in SAN notation
     * @returns {Object|null} Opening info or null
     */
    findOpening(moves) {
        if (moves.length === 0) {
            return { name: "Starting Position", eco: "" };
        }

        const moveString = moves.join(" ");
        let bestMatch = null;
        let bestMatchLength = 0;

        for (const opening of this.openings) {
            // Check if current moves start with or match this opening
            if (moveString.startsWith(opening.moves) || opening.moves.startsWith(moveString)) {
                const matchLength = Math.min(moveString.length, opening.moves.length);
                if (moveString.substring(0, matchLength) === opening.moves.substring(0, matchLength)) {
                    if (matchLength > bestMatchLength) {
                        bestMatch = opening;
                        bestMatchLength = matchLength;
                    }
                }
            }
        }

        if (bestMatch) {
            this.currentOpening = bestMatch;
            return bestMatch;
        }

        // If we had a previous match, keep showing it
        if (this.currentOpening) {
            return {
                name: this.currentOpening.name + " (left book)",
                eco: this.currentOpening.eco
            };
        }

        return { name: "Unknown Opening", eco: "" };
    }

    /**
     * Get suggested book moves for current position
     * @param {string[]} moves - Current move sequence
     * @returns {string[]} Array of possible book moves
     */
    getBookMoves(moves) {
        const moveString = moves.join(" ");
        const bookMoves = [];

        for (const opening of this.openings) {
            if (opening.moves.startsWith(moveString) && opening.moves.length > moveString.length) {
                const remaining = opening.moves.substring(moveString.length).trim();
                const nextMove = remaining.split(" ")[0];
                if (nextMove && !bookMoves.includes(nextMove)) {
                    bookMoves.push(nextMove);
                }
            }
        }

        return bookMoves;
    }

    /**
     * Check if current position is still in opening book
     * @param {string[]} moves - Current move sequence
     * @returns {boolean}
     */
    isInBook(moves) {
        const moveString = moves.join(" ");
        return this.openings.some(o =>
            o.moves.startsWith(moveString) || moveString.startsWith(o.moves)
        );
    }

    /**
     * Reset the opening tracker
     */
    reset() {
        this.currentOpening = null;
    }
}

// Export for use in other modules
window.OpeningBook = OpeningBook;
