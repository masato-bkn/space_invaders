"use strict";
class SpaceInvaders {
    constructor() {
        this.invaders = [];
        this.bullets = [];
        this.score = 0;
        this.gameRunning = true;
        this.keys = {};
        this.invaderDirection = 1;
        this.justTurnedAround = false;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 60,
            width: 50,
            height: 30,
            speed: 5,
            color: '#0f0'
        };
        this.initInvaders();
        this.setupEventListeners();
        this.gameLoop();
    }
    initInvaders() {
        const rows = 5;
        const cols = 10;
        const invaderWidth = 40;
        const invaderHeight = 30;
        const spacing = 10;
        const startX = 50;
        const startY = 50;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.invaders.push({
                    x: startX + col * (invaderWidth + spacing),
                    y: startY + row * (invaderHeight + spacing),
                    width: invaderWidth,
                    height: invaderHeight,
                    speed: 1,
                    color: '#f00'
                });
            }
        }
    }
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    update() {
        if (!this.gameRunning)
            return;
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
            }
            else {
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
        if (this.invaders.some(invader => invader.y + invader.height >= this.player.y - 10)) {
            this.gameRunning = false;
            alert('Game Over! Score: ' + this.score);
        }
    }
    shootBullet() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 7,
            color: '#ff0',
            isPlayerBullet: true
        });
    }
    moveInvaders() {
        const leftmostInvader = Math.min(...this.invaders.map(inv => inv.x));
        const rightmostInvader = Math.max(...this.invaders.map(inv => inv.x + inv.width));
        // 壁にぶつかったかチェック（前回の方向転換から十分離れている場合のみ）
        if (!this.justTurnedAround && (leftmostInvader <= 0 || rightmostInvader >= this.canvas.width)) {
            // 全てのインベーダーを下に移動し、方向を反転
            this.invaders.forEach(invader => {
                invader.y += 5;
            });
            this.invaderDirection *= -1;
            this.justTurnedAround = true;
            console.log('Wall hit! Direction changed to:', this.invaderDirection);
        }
        else {
            // 通常の横移動
            this.invaders.forEach(invader => {
                invader.x += invader.speed * this.invaderDirection;
            });
            // インベーダーが壁から離れたら方向転換を再び有効にする
            if (this.justTurnedAround && leftmostInvader > 10 && rightmostInvader < this.canvas.width - 10) {
                this.justTurnedAround = false;
            }
        }
        // インベーダーからの弾丸発射（ランダム）
        if (Math.random() < 0.02) {
            const randomInvader = this.invaders[Math.floor(Math.random() * this.invaders.length)];
            this.bullets.push({
                x: randomInvader.x + randomInvader.width / 2 - 2,
                y: randomInvader.y + randomInvader.height,
                width: 4,
                height: 10,
                speed: 3,
                color: '#f0f',
                isPlayerBullet: false
            });
        }
    }
    checkCollisions() {
        // プレイヤーの弾丸とインベーダーの衝突
        this.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.isPlayerBullet) {
                this.invaders.forEach((invader, invaderIndex) => {
                    if (this.isColliding(bullet, invader)) {
                        this.bullets.splice(bulletIndex, 1);
                        this.invaders.splice(invaderIndex, 1);
                        this.score += 10;
                        this.updateScore();
                    }
                });
            }
            else {
                // インベーダーの弾丸とプレイヤーの衝突
                if (this.isColliding(bullet, this.player)) {
                    this.gameRunning = false;
                    alert('Game Over! Score: ' + this.score);
                }
            }
        });
    }
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y;
    }
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.score}`;
        }
    }
    draw() {
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
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}
// ゲーム開始
window.addEventListener('load', () => {
    new SpaceInvaders();
});
//# sourceMappingURL=game.js.map