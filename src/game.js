import { tilemap } from "./tilemap.js";
import { player } from "./player.js";
import keys, { getItens, tile } from "./utils.js";
import { dataItens } from "./data/dataItens.js";
import { ITEMS } from "./itens.js";

const { Engine, Runner, Bodies, Composite, Events } = Matter;


let worldScale = 1;
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


const ladino = new player(engine);
const tileset = new Image();
tileset.src = "../assests/tiles/itens/FullSpritesheet/32x32.png"; // AJUSTA O CAMINHO


const imgPared1 = new Image();
imgPared1.src = "../assests/tiles/scenario/wall_right.png";
const imgParede2 = new Image();
imgParede2.src = "../assests/tiles/scenario/wall_hole_1.png";
const imgPared3 = new Image();
imgPared3.src = "../assests/tiles/scenario/wall_hole_2.png";
const imgPared4 = new Image();
imgPared4.src = "../assests/tiles/scenario/wall_mid.png";
const imgPared5 = new Image();
imgPared5.src = "../assests/tiles/scenario/wall_edge_tshape_right.png";
const imgPared6 = new Image();
imgPared6.src = "../assests/tiles/scenario/wall_edge_tshape_left.png";

const imgPared7 = new Image();
imgPared7.src = "../assests/tiles/scenario/atlas_walls_low-16x16.png";

const floorParede = [imgPared1, imgParede2, imgPared3, imgPared4];
const floorParedeP = [ imgPared5, imgPared6, imgPared7];

var floorChao = [];

for (let x = 1; x < 8; x++) {
  let chao = new Image();
  chao.src = `../assests/tiles/scenario/floor_${x}.png`;
  floorChao.push(chao);
}

tileset.onload = () => {
  renderLoop();
};

const drops = [];

    for (let i = 0; i < 20; i++) {
      const categorias = Object.values(dataItens);

      const tipo = Math.floor(Math.random() * categorias.length);
      const categoria = categorias[tipo];

      const itens = Object.values(categoria);
      const qual = Math.floor(Math.random() * itens.length);

      const item = itens[qual];

      const drop = new ITEMS(engine, item.id);

      drops.push(drop);
    }

function renderLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.scale(worldScale, worldScale);
    
  let bodies = Composite.allBodies(engine.world);
    // atualizar câmera

    camera.x = ladino.body.position.x - (canvas.width / worldScale) / 2;
    camera.y = ladino.body.position.y - (canvas.height / worldScale) / 2;


    const startX = Math.floor(camera.x / tile);
    const startY = Math.floor(camera.y / tile);

    const endX = startX + Math.ceil(canvas.width / tile);
    const endY = startY + Math.ceil(canvas.height / tile);

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      if (!tilemap[y] || tilemap[y][x] === undefined) continue;

        const tileValue = tilemap[y][x];

        const worldX = x * tile;
        const worldY = y * tile;

        const screenX = Math.floor(worldX - camera.x);
        const screenY = Math.floor(worldY - camera.y);
          
        const top = tilemap[y - 1]?.[x] ?? 0;
        const bottom = tilemap[y + 1]?.[x] ?? 0;
        const left = tilemap[y]?.[x - 1] ?? 0;
        const right = tilemap[y]?.[x + 1] ?? 0;
        
        const topLeft = tilemap[y - 1]?.[x - 1] ?? 0;
        const topRight = tilemap[y - 1]?.[x + 1] ?? 0;
        const bottomLeft = tilemap[y + 1]?.[x - 1] ?? 0;
        const bottomRight = tilemap[y + 1]?.[x + 1] ?? 0;

        const angle = Math.PI / 2;
      
        if (tileValue === 1) {
          let imgP;
        
          // parede isolada
          if (top === 0 && bottom === 0 && left === 0 && right === 0 ) {
            imgP = floorParedeP[2];
            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              screenX,
              screenY,
              tile + 1,
              tile + 1
            );
          }
          else if (top === 1 && bottom === 1 && left === 1 && right === 1 && bottomLeft === 0 || top === 1 && bottom === 1 && left === 1 && right === 1 && topLeft === 0) {
            imgP = floorParedeP[2];
          
            ctx.save();
          
            // move pro centro do tile
            ctx.translate(screenX + tile / 2, screenY + tile / 2);
          
            // gira 90 graus
            ctx.rotate(-Math.PI / 2);
          
            // desenha CENTRALIZADO
            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              -tile / 2,
              -tile / 2,
              tile,
              tile
            );
          
            ctx.restore();
          }
          else if (top === 1 && bottom === 1 && left === 1 && right === 1 && topRight === 0 || top === 1 && bottom === 1 && left === 1 && right === 1 && bottomRight === 0) {
            imgP = floorParedeP[2];
          
            ctx.save();
          
            // move pro centro do tile
            ctx.translate(screenX + tile / 2, screenY + tile / 2);
          
            // gira 90 graus
            ctx.rotate(Math.PI / 2);
          
            // desenha CENTRALIZADO
            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              -tile / 2,
              -tile / 2,
              tile,
              tile
            );
          
            ctx.restore();
          }
          // parede vertical
          else if (left === 1 && right === 1 && top === 0 && bottom === 0 || left === 1 && right === 0 && top === 0 && bottom === 0 || left === 0 && right === 1 && top === 0 && bottom === 0) {
            imgP = floorParedeP[2];
            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              screenX,
              screenY,
              tile + 1,
              tile + 1
            );
          }
          else if (top === 1 && bottom === 1 && left === 0 && right === 0 || top === 0 && bottom === 1 && left === 0 && right === 0 || top === 1 && bottom === 0 && left === 0 && right === 0) {
            imgP = floorParedeP[2];
          
            ctx.save();
          
            // move pro centro do tile
            ctx.translate(screenX + tile / 2, screenY + tile / 2);
          
            // gira 90 graus
            ctx.rotate(Math.PI / 2);
          
            // desenha CENTRALIZADO
            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              -tile / 2,
              -tile / 2,
              tile,
              tile
            );
          
            ctx.restore();
          }
          else if (left === 1 && right === 0 && top === 1 && bottom === 1) {
            imgP = floorParedeP[2];
          
            ctx.save();
          
            // move pro centro do tile
            ctx.translate(screenX + tile / 2, screenY + tile / 2);
          
            // gira 90 graus
            ctx.rotate(Math.PI / 2);
          
            // desenha CENTRALIZADO
            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              -tile / 2,
              -tile / 2,
              tile,
              tile
            );
          
            ctx.restore();
          }
          else if (left === 0 && right === 1 && top === 1 && bottom === 1) {
            imgP = floorParedeP[2];
          
            ctx.save();
          
            // move pro centro do tile
            ctx.translate(screenX + tile / 2, screenY + tile / 2);
          
            // gira 90 graus
            ctx.rotate(-Math.PI / 2);
          
            // desenha CENTRALIZADO
            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              -tile / 2,
              -tile / 2,
              tile,
              tile
            );
          
            ctx.restore();
          }
          else if (left === 1 && right === 1 && top === 0 && bottom === 1) {
            imgP = floorParedeP[2];
          
            ctx.save();
          
            // move pro centro do tile
            ctx.translate(screenX + tile / 2, screenY + tile / 2);
          
            // gira 90 graus
            ctx.rotate(Math.PI);
          
            // desenha CENTRALIZADO
            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              -tile / 2,
              -tile / 2,
              tile,
              tile
            );
          
            ctx.restore();
          }
          else if (left === 1 && right === 1 && top === 1 && bottom === 0 || top === 1 && left === 1 && bottom === 0 && right === 0 || top === 1 && left === 0 && bottom === 0 && right === 1) {
            imgP = floorParedeP[2];

            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              screenX,
              screenY,
              tile + 1,
              tile + 1
            );
          }
          else if (top === 0 && left === 1 && bottom === 1 && right === 0 || top === 0 && left === 0 && bottom === 1 && right === 1) {
            imgP = floorParedeP[2];
          
            ctx.save();
          
            // move pro centro do tile
            ctx.translate(screenX + tile / 2, screenY + tile / 2);
          
            // gira 90 graus
            ctx.rotate(Math.PI);
          
            // desenha CENTRALIZADO
            ctx.drawImage(
              imgP,
              2 * 16,
              2 * 16,
              16,
              16,
              -tile / 2,
              -tile / 2,
              tile + 1,
              tile + 1
            );
          
            ctx.restore();
          }
          // fallback
          else {
            const randomParede = Math.abs((x * 17 + y * 31)) % floorParede.length;
            imgP = floorParede[randomParede];
          }
        
        } else if (tileValue === 0) {
          // chão (sprite)
          const randomChao = Math.abs((x * 17 * y * 31) % floorChao.length);
          const imgC = floorChao[randomChao];
          ctx.drawImage(
            imgC,
            screenX,
            screenY,
            tile + 1,
            tile + 1
          );
    
        } else {
          continue;
        }
      }
    }

    // pegar todos os corpos

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
            continue
        } else {
          continue
        }
        ctx.fill();
    }
    // Render sprite player
    ladino.updateAnimation();
    
    for (const drop of drops) {
      if (!drop.collected) {
        drop.draw(ctx, camera);
      }
    }
    ladino.draw(ctx, camera);
    ctx.restore();
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
    if (key === "e" || key === "E") keys.pegarItem = true;
    if ((key === 'j') && !keys.attack) {
      keys.attack = true;
      keys.attackPressed = true; // 👈 clique único
    }
    if ((key === 'k' || key === "K") && !keys.attack) {
      keys.attack = true;
      keys.attackArc = true;
      keys.attackPressed = true; // 👈 clique único
    }
});
window.addEventListener("keyup", (e) => {
    let key = e.key.toLocaleLowerCase();
    if (key === 'w' || key === 'arrowup') keys.up = false;
    if (key === 's' || key === 'arrowdown') keys.down = false;
    if (key === 'a' || key === 'arrowleft') keys.left = false;
    if (key === 'd' || key === 'arrowright') keys.right = false;
    if (key === 'j') keys.attack = false;
    if (key === "e" || key === "E") keys.pegarItem = false;
    if (key === 'k' || key === "K") {
      keys.attackArc = false;
      keys.attack = false;
    }
});

const audio = new Audio("../assests/sounds/Cinematic/DevilTheDungeon.mp3");
audio.volume = 0;
audio.play();

let fadeInDuration = 10000;
let stepTime = 50;
let step = stepTime / fadeInDuration;

let interval = setInterval(() => {
  if (audio.volume < 1) {
    audio.volume = Math.min(1,audio.volume + step);
  } else {
    clearInterval(interval);
  }
}, stepTime);

// Iniciando o rederizador e o motor
const runner = Runner.create();
Runner.run(runner, engine);

Events.on(engine, 'beforeUpdate', () => {
    ladino.updateMove(keys);
        
    audio.play();
    ladino.attack(keys);
})

function resizeCanvas() {
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  // reseta transform
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  // escala do jogo (NÃO muda o tile)
  worldScale = Math.max(1, Math.min(window.innerWidth / 800, window.innerHeight / 600));
}

let itemEmContato = null;

Events.on(engine, "collisionStart", (event) => {
  for (let pair of event.pairs) {

    const a = pair.bodyA;
    const b = pair.bodyB;

    const itemBody = a.label === "item" ? a : b.label === "item" ? b : null;
    const playerBody = a.label === "player" ? a : b.label === "player" ? b : null;

    if (!itemBody || !playerBody) continue;

    itemEmContato = itemBody.itemRef;
  }
});

Events.on(engine, "collisionEnd", (event) => {
  for (let pair of event.pairs) {

    const a = pair.bodyA;
    const b = pair.bodyB;

    const itemBody = a.label === "item" ? a : b.label === "item" ? b : null;

    if (!itemBody) continue;

    if (itemEmContato && itemEmContato.body === itemBody) {
      itemEmContato = null;
    }
  }
});

Events.on(engine, "beforeUpdate", () => {

  ladino.updateMove(keys);
  ladino.attack(keys);

  if (keys.pegarItem && itemEmContato) {

    const itemId = itemEmContato.itemData;
    window.alert("Pegou item:" + itemId);

    Composite.remove(engine.world, itemEmContato.body);

    const index = drops.indexOf(itemEmContato);
    if (index !== -1) drops.splice(index, 1);

    itemEmContato = null;
    keys.pegarItem = false; // evita pegar várias vezes
  }
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
