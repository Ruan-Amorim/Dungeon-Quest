import { tile } from "./utils.js";
import { rooms, getRandomPositionInRoom } from "./tilemap.js";

const COLS = 16;
const { Bodies, Composite } = Matter;

export function getSpriteFromIndex(index, tile) {
  return {
    x: (index % COLS) * tile,
    y: Math.floor(index / COLS) * tile,
    w: tile,
    h: tile,
  };
}

export class ITEMS {
  constructor(engine, itemKey) {

    this.itemData = itemKey;

    const room = rooms[Math.floor(Math.random() * rooms.length)];
    this.pos = getRandomPositionInRoom(room);

    this.body = Bodies.rectangle(
      this.pos.x,
      this.pos.y,
      tile,
      tile,
      {
        isStatic: true,
        isSensor: true,
        label: "item",
      }
    );
    this.collected = false;
    this.body.itemRef = this;
    
    this.sprite = new Image();
    this.sprite.src = "../assests/tiles/itens/FullSpritesheet/32x32.png";

    Composite.add(engine.world, this.body);
  }

  draw(ctx, camera) {
    const spriteData = getSpriteFromIndex(this.itemData, tile);

    const x = this.body.position.x - camera.x - tile / 2;
    const y = this.body.position.y - camera.y - tile / 2;

    ctx.drawImage(
      this.sprite,
      spriteData.x,
      spriteData.y,
      spriteData.w,
      spriteData.h,
      x,
      y,
      tile,
      tile
    );
  }
}