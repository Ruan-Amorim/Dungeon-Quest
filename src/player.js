import { tile } from "./utils.js";
import { positionInicialX, positionInicialY } from "./tilemap.js";

const { Bodies, Composite, Body } = Matter;

export class player {
    constructor(engine) {
        this.HP = 20; // vida
        this.MP = 10; // mana
        this.STR = 5; // força
        this.INT = 5; // inteligência
        this.luk = 50; // sorte
        this.speed = 5;
        this.isAlive = true;

        this.isAttacking = false;
        this.attackStep = 0;

        // Criando o corpo físico (avatar)
        this.body = Bodies.rectangle(positionInicialX, positionInicialY, tile, tile, {
            inertia: Infinity, // impede de girar
            frictionAir: 0.1, // um pouco de resistência para parar suave
            label: "player",
        });

        // Assets
        this.sprite = new Image();
        this.sprite.src = "../assests/sprites/Character/Soldier/Soldier/Soldier.png";
        this.frameX = 0; // coluna
        this.frameY = 0; // linha (tipo animação: idle, walk...)
        this.frameWidth = 100;
        this.frameHeight = 100;
        this.flip = false;

        this.frameSpeed = 0.6;
        this.frameTimer = 0;
        this.numFrames = 6;
        // adicionando corpo ao mundo
        Composite.add(engine.world, this.body);
    }
    updateMove(key) {
        if (this.isAlive = false) return;
        let velX = 0;
        let velY = 0;
    
        if (key.left) {
            if (this.isAttacking == false) {
                velX = -this.speed;
                this.flip = true;
                this.numFrames = 8;
                this.frameY = 1;
            } else {
                velX = -this.speed;
                this.flip = true;
            }
        }
        if (key.right) {
            if (this.isAttacking == false) {
                velX = this.speed;
                this.flip = false;
                this.numFrames = 8;
                this.frameY = 1;
            } else {
                velX = this.speed;
                this.flip = false;
            }
        }
        if (key.up) {
            if (this.isAttacking == false) {
                velY = -this.speed;
                this.frameY = 0;
                this.numFrames = 8;
                this.frameY = 1;
            } else {
                velY = -this.speed;
            }
        }
        if (key.down) {
            if (this.isAttacking == false) {
                velY = this.speed;
                this.frameY = 0; 
                this.numFrames = 8;
                this.frameY = 1;
            } else {
                velY = this.speed;
            }
        }
    
        if (!key.left && !key.right && !key.up && !key.down) {
            if (this.isAttacking == false) {
                this.numFrames = 6;
                this.frameY = 0;
            } else {
                return;
            }
        }
    
        Body.setVelocity(this.body, { x: velX, y: velY });
    }
    updateAnimation() {
        this.frameTimer += this.frameSpeed;
    
        if (this.frameTimer >= 1) {
            this.frameX++;
            this.frameTimer = 0;
    
            if (this.isAttacking) {
                if (this.frameX >= this.numFrames) {
                    this.isAttacking = false;
    
                    // volta pro idle
                    this.frameY = 0;
                    this.numFrames = 6;
                    this.frameX = 0;
                }
            } else {
                if (this.frameX >= this.numFrames) {
                    this.frameX = 0;
                }
            }
        }
    }
    draw(ctx, camera) {
        const pos = this.body.position;
        const scale = 2; // tamanho
        const flipX = this.flip ? -1 : 1;
        ctx.save();

        const x = pos.x - camera.x;
        const y = pos.y - camera.y;

        ctx.translate(x, y);
        ctx.scale(scale * flipX, scale);

        ctx.drawImage(
            this.sprite,
            this.frameX * this.frameWidth,
            this.frameY * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            -this.frameWidth / 2,
            -this.frameHeight / 2,
            this.frameWidth,
            this.frameHeight,
        );

        ctx.restore();
    }
    attack(key) {
        if (key.attackPressed && !this.isAttacking) {
            this.startAttack();
        }
    
        // resetar clique
        key.attackPressed = false;
    }
    
    startAttack() {
        this.isAttacking = true;
    
        this.attackStep++;
        if (this.attackStep > 3) this.attackStep = 1;
    
        if (this.attackStep === 1) {
            this.frameY = 2;
            this.numFrames = 6;
        } else if (this.attackStep === 2) {
            this.frameY = 3;
            this.numFrames = 6;
        } else if (this.attackStep === 3) {
            this.frameY = 4;
            this.numFrames = 9;
        }
    
        this.frameX = 0;
    }
    takeDamage(dano) {
        this.HP -= dano;
        if (this.HP <= 0) this.isAlive = false;
    }
};
