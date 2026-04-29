import { tile } from "../utils.js";
import { rooms, getRandomPositionInRoom } from "../tilemap.js";

const { Bodies, Composite } = Matter;

export class Orc {
    constructor (engine, player) {
        this.HP = 20; // vida
        this.STR = 3; // força
        this.speed = 2;
        this.player = player;
        this.isAlive = true;

        this.animState = "idle";
        this.hitTime = 0;

        this.attackCooldown = 0;
        this.attackRate = 20; // frames (ex: 60 = 1 segundo a 60fps)

        const room = rooms[Math.floor(Math.random() * rooms.length + 1)];
        this.pos = getRandomPositionInRoom(room);

        this.body = Bodies.rectangle(
            this.pos.x,
            this.pos.y,
            tile,
            tile,
            {
                inertia: Infinity,
                frictionAir: 0.2, 
                label: "enemy",
            }
          );
        this.body.gameObject = this; // referência ao orc
        this.sprite = new Image();
        this.sprite.src = "./assests/sprites/Character/Orc/Orc/Orc.png";
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
    updateAnimation() {
        if (!this.isAlive) return;
        this.frameTimer += this.frameSpeed;
        if (this.frameTimer < 1) return;
    
        this.frameTimer = 0;
    
        // =====================
        // DEAD (não loopa)
        // =====================
        if (this.animState === "dead") {
    
            this.frameY = 6;
    
            if (this.frameX < this.numFrames - 1) {
                this.frameX++;
            } else {
                this.frameX = this.numFrames - 1;
            }
    
            return;
        }
    
        // =====================
        // HIT
        // =====================
        if (this.animState === "hit") {
    
            if (performance.now() > this.hitTime) {
                this.animState = "idle";
                this.frameY = 0;
                this.numFrames = 6;
                this.frameX = 0;
                return;
            }
    
            this.frameX++;
            if (this.frameX >= this.numFrames) {
                this.frameX = 0;
            }
    
            return;
        }
    
        // =====================
        // NORMAL
        // =====================
        this.frameX++;
    
        if (this.frameX >= this.numFrames) {
            this.frameX = 0;
        }
    }
    update() {
        if (this.animState === "dead") {
            this.updateAnimation();
            return;
        }
        if (this.animState === "hit") {
            Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
            this.updateAnimation();
            return;
        }
        if (!this.state) this.state = "wander";
        // =========================
        // ANIMAÇÃO GLOBAL
        // =========================
    
        const dx = this.player.body.position.x - this.body.position.x;
        const dy = this.player.body.position.y - this.body.position.y;
    
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        const detectRange = 200;
        const attackRange = 50;
        
        // =========================
        // COOLDOWN
        // =========================
        if (this.attackCooldown === undefined) {
            this.attackCooldown = 0;
            this.attackRate = 60;
        }
    
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    
        // =========================
        // DECISÃO DE ESTADO
        // =========================
        if (distance < detectRange) {
            if (distance <= attackRange) {
                this.state = "attack";
            } else {
                this.state = "chase";
            }
        } else {
            this.state = "wander";
        }
    
        // =========================
        // ATTACK
        // =========================
        if (this.state === "attack" && this.player.isAlive === true) {
    
            Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
    
            // animação de ataque
            this.frameY = 2;
            this.numFrames = 6;
    
            if (this.attackCooldown === 0) {
                this.doAttack();
                this.attackCooldown = this.attackRate;
            }
    
            this.updateAnimation();
            return;
        }
    
        // =========================
        // CHASE
        // =========================
        if (this.state === "chase") {
    
            const speed = this.speed + 2;
            const angle = Math.atan2(dy, dx);
    
            const velX = Math.cos(angle) * speed;
            const velY = Math.sin(angle) * speed;
    
            this.flip = velX < 0;
            this.frameY = 1;
            this.numFrames = 8;
    
            Matter.Body.setVelocity(this.body, {
                x: velX,
                y: velY
            });
    
            this.updateAnimation();
            return;
        }
    
        // =========================
        // WANDER
        // =========================
        const speed = this.speed;
    
        if (this.moving === undefined) this.moving = false;
        if (this.pause === undefined) this.pause = 0;
    
        if (this.pause > 0) {
            this.pause--;
            Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
            this.updateAnimation(); 
            return;
        }
    
        if (!this.moving) {
            const dirs = ["up", "down", "left", "right"];
            this.direction = dirs[Math.floor(Math.random() * dirs.length)];
    
            this.steps = 0;
            this.maxSteps = 16;
            this.moving = true;
        }
    
        let velX = 0;
        let velY = 0;
    
        this.frameY = 0;
        this.numFrames = 6;
    
        if (this.direction === "right") {
            velX = speed;
            this.flip = false;
        }
        if (this.direction === "left") {
            velX = -speed;
            this.flip = true;
        }
        if (this.direction === "up") {
            velY = -speed;
        }
        if (this.direction === "down") {
            velY = speed;
        }
    
        Matter.Body.setVelocity(this.body, { x: velX, y: velY });
    
        this.steps++;
    
        if (this.steps >= this.maxSteps) {
            this.moving = false;
            this.pause = 100;
        }
        this.updateAnimation();
    }
    draw(ctx, camera) {
        if (!this.sprite || !this.sprite.complete) return;

        const scale = 2;
        const flipX = this.flip ? -1 : 1;
      
        const x = this.body.position.x - camera.x;
        const y = this.body.position.y - camera.y;
      
        ctx.save();
      
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
          this.frameHeight
        );
      
        ctx.restore();
    }
    doAttack() {
        const dx = this.player.body.position.x - this.body.position.x;
        const dy = this.player.body.position.y - this.body.position.y;
    
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance < 60) {
            this.player.takeDamage(this.STR);
        }
    }
    takeDamage(dano) {
        if (this.animState === "dead") return;
    
        this.HP -= dano;
    
        if (this.HP <= 0) {
            this.isAlive = false;
            this.animState = "dead";
            this.HP = 0;
    
            this.frameX = 0;
            this.frameY = 6;
            this.numFrames = 4;
    
            return;
        }
    
        this.animState = "hit";
        this.hitTime = performance.now() + 120;
    
        this.frameX = 0;
        this.frameY = 5;
        this.numFrames = 4;
    }
}