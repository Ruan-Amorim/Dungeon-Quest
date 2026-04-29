import { tile } from "./utils.js";
import { positionInicialX, positionInicialY } from "./tilemap.js";

const { Bodies, Composite, Body } = Matter;

export class player {
    constructor(engine) {
        this.HP = 20; // vida atual
        this.MAX_HP = 20; // maximo de vida
        this.MP = 10; // mana
        this.STR = 5; // força
        this.INT = 5; // inteligência
        this.luk = 50; // sorte
        this.speed = 5;
        this.isAlive = true;

        this.hitboxActive = false;
        this.isAttacking = false;
        this.attackArc =  false;
        this.attackStep = 0;

        this.hitTimer = 0;
        this.animState = "idle";

        // Criando o corpo físico (avatar)
        this.body = Bodies.rectangle(positionInicialX, positionInicialY, tile, tile, {
            inertia: Infinity, // impede de girar
            frictionAir: 0.1, // um pouco de resistência para parar suave
            label: "player",
        });
        this.engine = engine;
        this.camera;
        // Assets
        this.sprite = new Image();
        this.sprite.src = "../assests/sprites/Character/Soldier/Soldier/Soldier.png";
        this.frameX = 0; // coluna
        this.frameY = 0; // linha (tipo animação: idle, walk...)
        this.frameWidth = 100;
        this.frameHeight = 100;
        this.flip = false;

        this.frameSpeed = 0.99;
        this.frameTimer = 0;
        this.numFrames = 6;
        // adicionando corpo ao mundo
        Composite.add(engine.world, this.body);
    }
    updateMove(key) {
        if (!this.isAlive) return;
        if (this.animState === "dead") return;

        let velX = 0;
        let velY = 0;
        if (this.animState !== "hit") {
    
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
    }
    updateAnimation() {
        this.frameTimer += this.frameSpeed;
        if (this.frameTimer < 1) return;

        this.frameTimer = 0;

        // =====================
        // DEAD (fixa linha + animação única)
        // =====================
        if (this.animState === "dead") {

            // fixa a linha da animação de morte SEMPRE
            this.frameY = 6; // <-- linha da morte no sprite sheet

            // avança até o último frame
            if (this.frameX < this.numFrames - 1) {
                this.frameX++;
            } else {
                this.frameX = this.numFrames - 1; // trava no último frame
            }

            return; // bloqueia qualquer outra lógica
        }

        this.frameX++;

        
        // =====================
        // HIT (SEM frameTimer BUGADO)
        // =====================
        if (this.animState === "hit") {

            this.frameY = 5;

            // controla tempo do hit
            if (performance.now() > this.hitTime) {
                this.animState = "idle";
                this.frameX = 0;
                this.numFrames = 6;
                return;
            }

            // animação simples sem frameTimer travando
            this.frameTimer += this.frameSpeed;
            if (this.frameTimer >= 1) {
                this.frameTimer = 0;
                this.frameX = (this.frameX + 1) % this.numFrames;
            }

            return;
        }
        // =====================
        // ATTACK
        // =====================
        if (this.isAttacking) {
            if (this.frameX >= this.numFrames) {
                this.isAttacking = false;
                this.animState = "idle";
                this.frameY = 0;
                this.numFrames = 6;
                this.frameX = 0;
            }
            return;
        }
        // =====================
        // IDLE / MOVE
        // =====================
        if (this.frameX >= this.numFrames) {
            this.frameX = 0;
        }
    }
    draw(ctx, camera) {
        const pos = this.body.position;
        const scale = 2; // tamanho
        const flipX = this.flip ? -1 : 1;
        
        this.camera = camera;

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
            this.startAttack(key);
        }
        key.attackPressed = false;
    }
    takeDamage(dano) {
        if (this.animState === "dead") return;
    
        this.HP -= dano;
    
        if (this.HP <= 0) {
            this.isAlive = false;
            this.animState = "dead";
            this.HP = 0;
            this.frameX = 0;
            this.frameY = 6;   // linha da morte
            this.numFrames = 4;
            this.upDateStatus();
            return;
        }
    
        this.animState = "hit";
        this.hitTime = performance.now() + 120;
    
        this.frameX = 0;
        this.frameY = 5;
        this.numFrames = 4;
    
        this.upDateStatus();
    }
    upDateStatus() {
        const player_hp = document.getElementById("player_hp");
        player_hp.innerText = `HP: ${this.HP}`;
    }
    startAttack(key) {
        this.isAttacking = true;
        if (this.hitboxActive === true) return;

        this.hitboxActive = true;

        const range = 45;

        this.attackStep++;
        if (this.attackStep > 2) this.attackStep = 1;

        if (key.attackArc) {
            this.frameY = 4;
            this.numFrames = 9;
        } else if (this.attackStep === 1) {
            this.frameY = 2;
            this.numFrames = 6;
        } else if (this.attackStep === 2) {
            this.frameY = 3;
            this.numFrames = 6;
        }

        const hitbox = Bodies.circle(
            this.body.position.x,
            this.body.position.y,
            range,
            {
                isSensor: true,
                isStatic: true,
                label: "playerAttack",
                owner: this, // referência ao player
            }
        );
        Composite.add(this.engine.world, hitbox);
        
        setTimeout(() => {
            Composite.remove(this.engine.world, hitbox);
            this.hitboxActive = false;
        }, 80);
    }
};
