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
declare class SpaceInvaders {
    private canvas;
    private ctx;
    private player;
    private invaders;
    private bullets;
    private score;
    private gameRunning;
    private keys;
    private invaderDirection;
    private justTurnedAround;
    constructor();
    private initInvaders;
    private setupEventListeners;
    private update;
    private shootBullet;
    private moveInvaders;
    private checkCollisions;
    private isColliding;
    private updateScore;
    private draw;
    private gameLoop;
}
