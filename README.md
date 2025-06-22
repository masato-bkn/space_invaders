# Space Invaders

A classic Space Invaders game implemented in TypeScript with HTML5 Canvas.

![Space Invaders](https://github.com/user-attachments/assets/974bfc7f-ba13-4bfa-ab8b-afe809fe0b2a)

## Features

- 🎮 Classic space invaders gameplay
- 🎯 Player movement with arrow keys
- 🚀 Shooting with spacebar (anti-rapid fire system)
- 👾 50 enemy invaders in 5x10 formation
- 🏀 Proper wall collision detection with direction reversal
- 📊 Real-time score tracking
- 🎊 Win/lose game conditions
- 🎨 Smooth 60fps animation using `requestAnimationFrame`

## How to Play

- Use **Left/Right arrow keys** to move your ship horizontally
- Press **Spacebar** to shoot bullets at invaders
- **Objective**: Destroy all 50 invaders to win
- **Avoid**: Getting hit by enemy bullets
- **Warning**: Don't let invaders reach your position!

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd invaders
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

4. **Start the development server:**
   ```bash
   npm run serve
   ```

5. **Play the game:**
   Open your browser and navigate to `http://localhost:8000`

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run watch` | Watch for changes and auto-compile |
| `npm run serve` | Start local HTTP server on port 8000 |

## Project Structure

```
invaders/
├── game.ts          # Main game logic (TypeScript)
├── index.html       # Game HTML page
├── dist/            # Compiled JavaScript files
│   ├── game.js      # Compiled game logic
│   └── game.d.ts    # Type definitions
├── package.json     # Project configuration
└── tsconfig.json    # TypeScript configuration
```

## Technical Details

### Architecture
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas 2D Context
- **Animation**: `requestAnimationFrame` for smooth 60fps
- **Input**: Keyboard event listeners

### Key Classes & Interfaces
```typescript
interface GameObject {
    x: number;       // X position
    y: number;       // Y position  
    width: number;   // Object width
    height: number;  // Object height
    color: string;   // Render color
}

interface Player extends GameObject {
    speed: number;   // Movement speed
}

interface Invader extends GameObject {
    speed: number;   // Movement speed
}

interface Bullet extends GameObject {
    speed: number;           // Movement speed
    isPlayerBullet: boolean; // Ownership flag
}
```

### Game Mechanics

#### Invader Movement
- **Formation**: 5 rows × 10 columns (50 total invaders)
- **Movement Pattern**: 
  - Move horizontally as a group
  - When hitting screen edge: drop down 5 pixels + reverse direction
  - **Fixed Bug**: Prevents multiple direction changes per frame using `justTurnedAround` flag

#### Player Controls
- **Movement**: Left/Right arrows (speed: 5 pixels per frame)
- **Shooting**: Spacebar (bullet speed: 7 pixels per frame upward)
- **Boundary**: Cannot move outside screen edges

#### Enemy Behavior
- **Movement**: Unified direction controlled by `invaderDirection` variable
- **Shooting**: Random invaders fire bullets (2% chance per frame)
- **Bullet Speed**: 3 pixels per frame downward

#### Collision Detection
- **Algorithm**: Axis-Aligned Bounding Box (AABB)
- **Player vs Enemy Bullets**: Instant game over
- **Player Bullets vs Invaders**: Destroy invader, +10 points

#### Win/Lose Conditions
- **Victory**: Destroy all 50 invaders
- **Defeat**: 
  - Player hit by enemy bullet
  - Invaders reach player's vertical position (y-coordinate)

## Development Notes

### Recent Fixes
1. **Wall Collision Bug**: Fixed invaders getting stuck or causing immediate game over when hitting walls
2. **Direction Reversal**: Implemented proper group movement with unified direction control
3. **Frame-Perfect Logic**: Added `justTurnedAround` flag to prevent multiple direction changes per frame

### Performance Optimizations
- Uses `requestAnimationFrame` for optimal frame rate
- Efficient collision detection with early termination
- Bullet cleanup when off-screen to prevent memory leaks

## Browser Compatibility

- Modern browsers supporting HTML5 Canvas
- Chrome, Firefox, Safari, Edge (latest versions)
- Requires JavaScript enabled