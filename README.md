# Chess with Adaptive AI

A browser-based chess game where an AI opponent adapts to your skill level, starting at 200 Elo and adjusting based on your performance.

## Features

- **Adaptive AI**: Stockfish engine adjusts difficulty based on your Elo rating
- **Elo Rating System**: Track your progress with a real rating system (K=32)
- **Opening Book**: Recognizes 70+ common chess openings with ECO codes
- **Move History**: Full game notation with captured pieces display
- **Elo Chart**: Visualize your rating progression over time
- **Persistent Stats**: All data saved in localStorage

## Quick Start

1. Open `index.html` in a modern browser
2. Play as White - drag and drop pieces to move
3. Win or lose games to adjust AI difficulty
4. Your Elo persists across sessions

No installation or build step required.

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Chess Logic**: [chess.js](https://github.com/jhlywa/chess.js)
- **Board UI**: [chessboard.js](https://chessboardjs.com/)
- **AI Engine**: [Stockfish.js](https://github.com/nicolo-ribaudo/nicolo-ribaudo.github.io) (WASM, loaded from CDN)
- **Charts**: [Chart.js](https://www.chartjs.org/)

## How It Works

### Elo to Stockfish Skill Mapping

| Your Elo | Stockfish Skill |
|----------|-----------------|
| 200-400 | 0-2 |
| 400-800 | 3-6 |
| 800-1200 | 7-10 |
| 1200-1600 | 11-14 |
| 1600-2000 | 15-17 |
| 2000+ | 18-20 |

### Elo Calculation

Uses standard Elo formula with K-factor of 32:
```
New Rating = Old Rating + K × (Actual Score - Expected Score)
Expected Score = 1 / (1 + 10^((Opponent - Player) / 400))
```

## Project Structure

```
chess-adaptive-ai/
├── index.html          # Main game page
├── css/
│   └── style.css       # Dark theme styling
├── js/
│   ├── app.js          # Main application controller
│   ├── engine.js       # Stockfish wrapper (UCI protocol)
│   ├── elo.js          # Elo calculation & localStorage
│   ├── openings.js     # ECO opening database
│   └── history.js      # Move history & captured pieces
└── lib/
    └── chessboard/     # Board library (jQuery-free)
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).

## License

MIT
