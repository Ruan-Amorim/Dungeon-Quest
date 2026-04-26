import { player } from "./player.js";
import keys, { tile, tilemap, updateTile } from "./utils.js";
const { Engine, Runner, Bodies, Composite, Events } = Matter;


// Criando motor físico
const engine = Engine.create();

// Desativar a gravidade
engine.gravity.y = 0;

// Criando renderizador (O que desenha na tela)

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const camera = {
    x: 0,
    y: 0
};
function renderLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // atualizar câmera
    camera.x = ladino.body.position.x - canvas.width / 2;
    camera.y = ladino.body.position.y - canvas.height / 2;

    for (let y = 0; y < tilemap.length; y++) {
        for (let x = 0; x < tilemap[y].length; x++) {
      
          const tileValue = tilemap[y][x];
      
          const worldX = x * tile;
          const worldY = y * tile;
      
          const screenX = worldX - camera.x;
          const screenY = worldY - camera.y;
      
          if (tileValue === 1) {
            ctx.fillStyle = "gray"; // parede
          } else if (tileValue === 0) {
            ctx.fillStyle = "#f2f2f2";
          }
      
          ctx.fillRect(screenX, screenY, tile, tile);
        }
      }

    // pegar todos os corpos
    const bodies = Composite.allBodies(engine.world);

    for (let body of bodies) {
        const vertices = body.vertices;

        ctx.beginPath();
        ctx.moveTo(
            vertices[0].x - camera.x,
            vertices[0].y - camera.y
        );

        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(
                vertices[i].x - camera.x,
                vertices[i].y - camera.y
            );
        }

        ctx.closePath();

        // cor básica por tipo
        if (body.label === "mob") {
            ctx.fillStyle = "red";
        } else if (body.label === "player") {
            ctx.fillStyle = "blue";
        } else {
            ctx.fillStyle = "gray";
        }

        ctx.fill();
    }
    
    requestAnimationFrame(renderLoop);
}

for (let y = 0; y < tilemap.length; y++) {
  for (let x = 0; x < tilemap[y].length; x++) {

    if (tilemap[y][x] === 1) {

      const wall = Bodies.rectangle(
        x * tile + tile / 2,
        y * tile + tile / 2,
        tile,
        tile,
        { isStatic: true, label: "wall" }
      );

      Composite.add(engine.world, wall);
    }
  }
}
// OBSERVANDO TECLAS
window.addEventListener("keydown", (e) => {
    let key = e.key.toLocaleLowerCase();
    if (key === 'w' || key === 'arrowup') keys.up = true;
    if (key === 's' || key === 'arrowdown') keys.down = true;
    if (key === 'a' || key === 'arrowleft') keys.left = true;
    if (key === 'd' || key === 'arrowright') keys.right = true;
});
window.addEventListener("keyup", (e) => {
    let key = e.key.toLocaleLowerCase();
    if (key === 'w' || key === 'arrowup') keys.up = false;
    if (key === 's' || key === 'arrowdown') keys.down = false;
    if (key === 'a' || key === 'arrowleft') keys.left = false;
    if (key === 'd' || key === 'arrowright') keys.right = false;
});

// Iniciando o rederizador e o motor
const runner = Runner.create();
Runner.run(runner, engine);

const ladino = new player(engine)

Events.on(engine, 'beforeUpdate', () => {
    ladino.updateMove(keys);
})

function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

window.addEventListener("resize", () => {
    const newTile = Math.floor(
        Math.min(window.innerWidth / 25, window.innerHeight / 18)
    );

    updateTile(newTile);
});

renderLoop();