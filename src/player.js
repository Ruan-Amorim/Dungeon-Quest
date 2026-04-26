import { positionInicialX, positionInicialY, tile } from "./utils.js";


const { Engine, Render, Runner, Bodies, Composite, Body } = Matter;

export class player {
    constructor( engine) {
        this.HP = 20; // vida
        this.MP = 10; // mana
        this.STR = 5; // força
        this.INT = 5; // inteligência
        this.luk = 50; // sorte
        this.speed = 5;
        this.isAlive = true;

        // Criando o corpo físico (avatar)
        this.body = Bodies.rectangle(positionInicialX, positionInicialY, tile, tile, {
            inertia: Infinity, // impede de girar
            frictionAir: 0.1, // um pouco de resistência para parar suave
            label: "player",
        });
        // adicionando corpo ao mundo
        Composite.add(engine.world, this.body)
    }
    updateMove(key) {
        let velX = 0;
        let velY = 0;

        if (key.left) velX = -this.speed;
        if (key.right) velX = this.speed;
        if (key.up) velY = -this.speed;
        if (key.down) velY = this.speed;

        Body.setVelocity(this.body, {x: velX, y: velY})
    }
    takeDamage(dano) {
        this.HP -= dano;
        if (this.HP <= 0) this.isAlive = false;
    }
};
