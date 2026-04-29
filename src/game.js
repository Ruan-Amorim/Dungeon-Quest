import { tilemap } from "./tilemap.js";
import { player } from "./player.js";
import keys, { tile } from "./utils.js";
import { dataItens } from "./data/dataItens.js";
import { ITEMS } from "./itens.js";
import { Orc } from "./enemys/orc.js";

const { Engine, Runner, Bodies, Composite, Events, Body } = Matter;


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

    for (let i = 0; i < 10; i++) {
      const categorias = Object.values(dataItens);

      const tipo = Math.floor(Math.random() * categorias.length);
      const categoria = categorias[tipo];

      const itens = Object.values(categoria);
      const qual = Math.floor(Math.random() * itens.length);

      const item = itens[qual];

      const drop = new ITEMS(engine, item.id);

      drops.push(drop);
    }
const orcs = [];

for (let i = 0; i < 8; i++) {
  const orc = new Orc(engine, ladino);
  orcs.push(orc); 
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
    const margin = 100
    for (const orc of orcs) {
      if (!orc.collected) {
        const x = orc.body.position.x;
        const y = orc.body.position.y;

        const visible = x > camera.x - margin && x < camera.x + canvas.width / worldScale + margin && y > camera.y - margin && y < camera.y + canvas.height / worldScale + margin;

        if (!visible) continue;
        orc.update();
        orc.draw(ctx, camera);
      }
    }
    ladino.draw(ctx, camera);
    ctx.restore();
    requestAnimationFrame(renderLoop);
}
const visited = new Set();

for (let y = 0; y < tilemap.length; y++) {
  for (let x = 0; x < tilemap[y].length; x++) {

    if (tilemap[y][x] !== 1) continue;
    const isInternal =
    tilemap[y - 1]?.[x] === 1 &&
    tilemap[y + 1]?.[x] === 1 &&
    tilemap[y]?.[x - 1] === 1 &&
    tilemap[y]?.[x + 1] === 1 &&
    tilemap[y - 1]?.[x - 1] === 1 &&
    tilemap[y - 1]?.[x + 1] === 1 &&
    tilemap[y + 1]?.[x - 1] === 1 &&
    tilemap[y + 1]?.[x + 1] === 1;

    if (isInternal) continue;

    const key = `${x},${y}`;
    if (visited.has(key)) continue;

    // 1. largura
    let width = 1;
    while (
      tilemap[y]?.[x + width] === 1 &&
      !visited.has(`${x + width},${y}`)
    ) {
      width++;
    }

    // 2. altura (checando toda a largura)
    let height = 1;
    let canExpand = true;

    while (canExpand) {
      for (let i = 0; i < width; i++) {
        if (
          tilemap[y + height]?.[x + i] !== 1 ||
          visited.has(`${x + i},${y + height}`)
        ) {
          canExpand = false;
          break;
        }
      }

      if (canExpand) height++;
    }

    // marcar tudo como visitado
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        visited.add(`${x + dx},${y + dy}`);
      }
    }

    // criar 1 body grande
    const wall = Bodies.rectangle(
      (x + width / 2) * tile,
      (y + height / 2) * tile,
      tile * width,
      tile * height,
      {
        isStatic: true,
        label: "wall"
      }
    );

    Composite.add(engine.world, wall);
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

const audio = new Audio("../assests/sounds/Cinematic/cavernadecristal.mp3");
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
    
    // hitbox attack
    if (a.label === "playerAttack" && b.label === "enemy") {
      const nemesis = b.gameObject;
      const player = a.owner;

      nemesis.takeDamage(player.STR);
      // knokback
      const dx = b.position.x - player.body.position.x;
      const dy = b.position.y - player.body.position.y;
      const length = Math.sqrt(dx * dx + dy * dy) || 1;

      const nx = dx / length;
      const ny = dy / length;

      Body.applyForce(b,b.position, {
        x: nx * 32,
        y: ny * 32,
      });
    } else if (b.label === "playerAttack" && a.label === "enemy") {
      const nemesis = a.gameObject;
      const player = b.owner;

      nemesis.takeDamage(player.STR);
      // knokback
      const dx = b.position.x - player.body.position.x;
      const dy = b.position.y - player.body.position.y;
      const length = Math.sqrt(dx * dx + dy * dy) || 1;

      const nx = dx / length;
      const ny = dy / length;

      Body.applyForce(a,a.position, {
        x: nx * 32,
        y: ny * 32,
      });
    }
    // pegar item
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


const bodies = Composite.allBodies(engine.world);
        let count = {};
        for (let b of bodies) {
            count[b.label] = (count[b.label] || 0) + 1;
        }
        console.log(count)
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
