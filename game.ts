// Game configuration constants
const GAME_CONFIG = {
    PLAYER: {
        WIDTH: 50,
        HEIGHT: 30,
        SPEED: 5,
        COLOR: '#0f0',
        BOTTOM_MARGIN: 60
    },
    INVADER: {
        ROWS: 5,
        COLS: 10,
        WIDTH: 40,
        HEIGHT: 30,
        SPEED: 1,
        COLOR: '#f00',
        SPACING: 10,
        START_X: 50,
        START_Y: 50,
        DROP_DISTANCE: 5,
        SHOOT_CHANCE: 0.02
    },
    BULLET: {
        WIDTH: 4,
        HEIGHT: 10,
        PLAYER_SPEED: 7,
        INVADER_SPEED: 3,
        PLAYER_COLOR: '#ff0',
        INVADER_COLOR: '#f0f'
    },
    GAME: {
        POINTS_PER_INVADER: 10,
        WALL_BUFFER: 10,
        PLAYER_COLLISION_BUFFER: 10
    }
} as const;

interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

interface Player extends GameObject {
    speed: number;
}

interface Invader extends GameObject {
    speed: number;
}

interface Bullet extends GameObject {
    speed: number;
    isPlayerBullet: boolean;
}

class SpaceInvaders {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private invaders: Invader[] = [];
    private bullets: Bullet[] = [];
    private score: number = 0;
    private gameRunning: boolean = true;
    private keys: { [key: string]: boolean } = {};
    private invaderDirection: number = 1;
    private justTurnedAround: boolean = false;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        this.player = {
            x: this.canvas.width / 2 - GAME_CONFIG.PLAYER.WIDTH / 2,
            y: this.canvas.height - GAME_CONFIG.PLAYER.BOTTOM_MARGIN,
            width: GAME_CONFIG.PLAYER.WIDTH,
            height: GAME_CONFIG.PLAYER.HEIGHT,
            speed: GAME_CONFIG.PLAYER.SPEED,
            color: GAME_CONFIG.PLAYER.COLOR
        };

        this.initInvaders();
        this.setupEventListeners();
        this.gameLoop();
    }

    private initInvaders(): void {
        for (let row = 0; row < GAME_CONFIG.INVADER.ROWS; row++) {
            for (let col = 0; col < GAME_CONFIG.INVADER.COLS; col++) {
                this.invaders.push({
                    x: GAME_CONFIG.INVADER.START_X + col * (GAME_CONFIG.INVADER.WIDTH + GAME_CONFIG.INVADER.SPACING),
                    y: GAME_CONFIG.INVADER.START_Y + row * (GAME_CONFIG.INVADER.HEIGHT + GAME_CONFIG.INVADER.SPACING),
                    width: GAME_CONFIG.INVADER.WIDTH,
                    height: GAME_CONFIG.INVADER.HEIGHT,
                    speed: GAME_CONFIG.INVADER.SPEED,
                    color: GAME_CONFIG.INVADER.COLOR
                });
            }
        }
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    private update(): void {
        if (!this.gameRunning) return;

        // プレイヤーの移動
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }

        // 弾丸発射
        if (this.keys['Space']) {
            this.shootBullet();
            this.keys['Space'] = false; // 連射防止
        }

        // 弾丸の移動
        this.bullets = this.bullets.filter(bullet => {
            if (bullet.isPlayerBullet) {
                bullet.y -= bullet.speed;
                return bullet.y > 0;
            } else {
                bullet.y += bullet.speed;
                return bullet.y < this.canvas.height;
            }
        });

        // インベーダーの移動
        this.moveInvaders();

        // 衝突判定
        this.checkCollisions();

        // ゲーム終了判定
        if (this.invaders.length === 0) {
            this.gameRunning = false;
            alert('You Win! Score: ' + this.score);
        }

        // インベーダーがプレイヤーの位置まで到達した場合のみゲームオーバー
        if (this.invaders.some(invader => invader.y + invader.height >= this.player.y - GAME_CONFIG.GAME.PLAYER_COLLISION_BUFFER)) {
            this.gameRunning = false;
            alert('Game Over! Score: ' + this.score);
        }
    }

    private shootBullet(): void {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - GAME_CONFIG.BULLET.WIDTH / 2,
            y: this.player.y,
            width: GAME_CONFIG.BULLET.WIDTH,
            height: GAME_CONFIG.BULLET.HEIGHT,
            speed: GAME_CONFIG.BULLET.PLAYER_SPEED,
            color: GAME_CONFIG.BULLET.PLAYER_COLOR,
            isPlayerBullet: true
        });
    }

    private moveInvaders(): void {
        const leftmostInvader = Math.min(...this.invaders.map(inv => inv.x));
        const rightmostInvader = Math.max(...this.invaders.map(inv => inv.x + inv.width));

        // 壁にぶつかったかチェック（前回の方向転換から十分離れている場合のみ）
        if (!this.justTurnedAround && (leftmostInvader <= 0 || rightmostInvader >= this.canvas.width)) {
            // 全てのインベーダーを下に移動し、方向を反転
            this.invaders.forEach(invader => {
                invader.y += GAME_CONFIG.INVADER.DROP_DISTANCE;
            });
            this.invaderDirection *= -1;
            this.justTurnedAround = true;
            console.log('Wall hit! Direction changed to:', this.invaderDirection);
        } else {
            // 通常の横移動
            this.invaders.forEach(invader => {
                invader.x += invader.speed * this.invaderDirection;
            });
            
            // インベーダーが壁から離れたら方向転換を再び有効にする
            if (this.justTurnedAround && leftmostInvader > GAME_CONFIG.GAME.WALL_BUFFER && rightmostInvader < this.canvas.width - GAME_CONFIG.GAME.WALL_BUFFER) {
                this.justTurnedAround = false;
            }
        }

        // インベーダーからの弾丸発射（ランダム）
        if (Math.random() < GAME_CONFIG.INVADER.SHOOT_CHANCE) {
            const randomInvader = this.invaders[Math.floor(Math.random() * this.invaders.length)];
            this.bullets.push({
                x: randomInvader.x + randomInvader.width / 2 - GAME_CONFIG.BULLET.WIDTH / 2,
                y: randomInvader.y + randomInvader.height,
                width: GAME_CONFIG.BULLET.WIDTH,
                height: GAME_CONFIG.BULLET.HEIGHT,
                speed: GAME_CONFIG.BULLET.INVADER_SPEED,
                color: GAME_CONFIG.BULLET.INVADER_COLOR,
                isPlayerBullet: false
            });
        }
    }

    private checkCollisions(): void {
        // プレイヤーの弾丸とインベーダーの衝突
        this.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.isPlayerBullet) {
                this.invaders.forEach((invader, invaderIndex) => {
                    if (this.isColliding(bullet, invader)) {
                        this.bullets.splice(bulletIndex, 1);
                        this.invaders.splice(invaderIndex, 1);
                        this.score += GAME_CONFIG.GAME.POINTS_PER_INVADER;
                        this.updateScore();
                    }
                });
            } else {
                // インベーダーの弾丸とプレイヤーの衝突
                if (this.isColliding(bullet, this.player)) {
                    this.gameRunning = false;
                    alert('Game Over! Score: ' + this.score);
                }
            }
        });
    }

    private isColliding(obj1: GameObject, obj2: GameObject): boolean {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    private updateScore(): void {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.score}`;
        }
    }

    private draw(): void {
        // 画面クリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // プレイヤー描画
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // インベーダー描画
        this.invaders.forEach(invader => {
            this.ctx.fillStyle = invader.color;
            this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
        });

        // 弾丸描画
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    private gameLoop(): void {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// ゲーム開始
window.addEventListener('load', () => {
    new SpaceInvaders();
});