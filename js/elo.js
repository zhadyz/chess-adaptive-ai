/**
 * Elo Rating System
 * Handles calculation, storage, and tracking of player Elo
 */

class EloSystem {
    constructor() {
        this.K_FACTOR = 32; // Higher K = faster rating changes
        this.STARTING_ELO = 200;
        this.MIN_ELO = 100;
        this.MAX_ELO = 3000;

        this.loadFromStorage();
    }

    /**
     * Load Elo data from localStorage
     */
    loadFromStorage() {
        const stored = localStorage.getItem('chessEloData');
        if (stored) {
            const data = JSON.parse(stored);
            this.currentElo = data.currentElo || this.STARTING_ELO;
            this.highestElo = data.highestElo || this.STARTING_ELO;
            this.history = data.history || [{ elo: this.STARTING_ELO, date: Date.now(), game: 0 }];
            this.stats = data.stats || { wins: 0, losses: 0, draws: 0 };
        } else {
            this.reset();
        }
    }

    /**
     * Save Elo data to localStorage
     */
    saveToStorage() {
        const data = {
            currentElo: this.currentElo,
            highestElo: this.highestElo,
            history: this.history,
            stats: this.stats
        };
        localStorage.setItem('chessEloData', JSON.stringify(data));
    }

    /**
     * Reset all Elo data
     */
    reset() {
        this.currentElo = this.STARTING_ELO;
        this.highestElo = this.STARTING_ELO;
        this.history = [{ elo: this.STARTING_ELO, date: Date.now(), game: 0 }];
        this.stats = { wins: 0, losses: 0, draws: 0 };
        this.saveToStorage();
    }

    /**
     * Calculate expected score using Elo formula
     * @param {number} playerRating
     * @param {number} opponentRating
     * @returns {number} Expected score (0-1)
     */
    expectedScore(playerRating, opponentRating) {
        return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    }

    /**
     * Calculate new Elo rating after a game
     * @param {number} playerRating - Current player rating
     * @param {number} opponentRating - Opponent's rating
     * @param {number} actualScore - 1 for win, 0.5 for draw, 0 for loss
     * @returns {number} New rating
     */
    calculateNewRating(playerRating, opponentRating, actualScore) {
        const expected = this.expectedScore(playerRating, opponentRating);
        const change = this.K_FACTOR * (actualScore - expected);
        return Math.round(playerRating + change);
    }

    /**
     * Map player Elo to Stockfish skill level (0-20)
     * @param {number} elo - Player Elo rating
     * @returns {number} Stockfish skill level
     */
    eloToStockfishSkill(elo) {
        if (elo < 400) return Math.floor((elo - 100) / 100); // 0-2
        if (elo < 800) return Math.floor((elo - 400) / 100) + 3; // 3-6
        if (elo < 1200) return Math.floor((elo - 800) / 100) + 7; // 7-10
        if (elo < 1600) return Math.floor((elo - 1200) / 100) + 11; // 11-14
        if (elo < 2000) return Math.floor((elo - 1600) / 100) + 15; // 15-17
        return Math.min(20, Math.floor((elo - 2000) / 150) + 18); // 18-20
    }

    /**
     * Get estimated AI Elo based on skill level
     * @param {number} skillLevel - Stockfish skill (0-20)
     * @returns {number} Estimated Elo
     */
    skillToEstimatedElo(skillLevel) {
        // Rough estimates of Stockfish skill to Elo
        const eloMap = {
            0: 200, 1: 300, 2: 400,
            3: 500, 4: 600, 5: 700, 6: 800,
            7: 900, 8: 1000, 9: 1100, 10: 1200,
            11: 1300, 12: 1400, 13: 1500, 14: 1600,
            15: 1700, 16: 1800, 17: 1900,
            18: 2100, 19: 2400, 20: 2800
        };
        return eloMap[skillLevel] || 1200;
    }

    /**
     * Record a game result and update Elo
     * @param {string} result - 'win', 'loss', or 'draw'
     * @param {number} aiSkillLevel - The AI's skill level during the game
     * @returns {Object} { oldElo, newElo, change }
     */
    recordGame(result, aiSkillLevel) {
        const oldElo = this.currentElo;
        const aiElo = this.skillToEstimatedElo(aiSkillLevel);

        let actualScore;
        switch (result) {
            case 'win':
                actualScore = 1;
                this.stats.wins++;
                break;
            case 'loss':
                actualScore = 0;
                this.stats.losses++;
                break;
            case 'draw':
                actualScore = 0.5;
                this.stats.draws++;
                break;
            default:
                throw new Error('Invalid result: ' + result);
        }

        this.currentElo = this.calculateNewRating(oldElo, aiElo, actualScore);

        // Clamp to min/max
        this.currentElo = Math.max(this.MIN_ELO, Math.min(this.MAX_ELO, this.currentElo));

        // Update highest
        if (this.currentElo > this.highestElo) {
            this.highestElo = this.currentElo;
        }

        // Add to history
        this.history.push({
            elo: this.currentElo,
            date: Date.now(),
            game: this.getTotalGames(),
            result: result,
            aiElo: aiElo
        });

        // Keep history manageable (last 100 games)
        if (this.history.length > 101) {
            this.history = this.history.slice(-101);
        }

        this.saveToStorage();

        return {
            oldElo: oldElo,
            newElo: this.currentElo,
            change: this.currentElo - oldElo,
            aiElo: aiElo
        };
    }

    /**
     * Get current Elo rating
     * @returns {number}
     */
    getCurrentElo() {
        return this.currentElo;
    }

    /**
     * Get the current Stockfish skill level based on player Elo
     * @returns {number}
     */
    getCurrentSkillLevel() {
        return this.eloToStockfishSkill(this.currentElo);
    }

    /**
     * Get total games played
     * @returns {number}
     */
    getTotalGames() {
        return this.stats.wins + this.stats.losses + this.stats.draws;
    }

    /**
     * Get all statistics
     * @returns {Object}
     */
    getStats() {
        return {
            ...this.stats,
            total: this.getTotalGames(),
            currentElo: this.currentElo,
            highestElo: this.highestElo,
            skillLevel: this.getCurrentSkillLevel()
        };
    }

    /**
     * Get Elo history for charting
     * @returns {Array}
     */
    getHistory() {
        return this.history;
    }

    /**
     * Get performance rating (last N games)
     * @param {number} n - Number of games to consider
     * @returns {number}
     */
    getPerformanceRating(n = 10) {
        const recentGames = this.history.slice(-n);
        if (recentGames.length < 2) return this.currentElo;

        let totalOpponentElo = 0;
        let score = 0;
        let games = 0;

        for (const game of recentGames) {
            if (game.result && game.aiElo) {
                totalOpponentElo += game.aiElo;
                if (game.result === 'win') score += 1;
                else if (game.result === 'draw') score += 0.5;
                games++;
            }
        }

        if (games === 0) return this.currentElo;

        const avgOpponent = totalOpponentElo / games;
        const percentage = score / games;

        // Performance rating formula
        if (percentage === 1) return avgOpponent + 400;
        if (percentage === 0) return avgOpponent - 400;

        return Math.round(avgOpponent + 400 * Math.log10(percentage / (1 - percentage)));
    }
}

// Export for use in other modules
window.EloSystem = EloSystem;
