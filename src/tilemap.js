import { tile } from "./utils.js";

const WIDTH = 100;
const HEIGHT = 100;

export const rooms = [];

export const tilesMapa = 100 * tile;

export const tilemap = Array.from({ length: HEIGHT }, () =>
  Array(WIDTH).fill(1)
);

function roomsOverlap(roomA, roomB) {
    const padding = 1; // espaço entre salas
  
    return (
      roomA.x < roomB.x + roomB.width + padding &&
      roomA.x + roomA.width + padding > roomB.x &&
      roomA.y < roomB.y + roomB.height + padding &&
      roomA.y + roomA.height + padding > roomB.y
    );
  }

const maxRooms = 20;
const maxTries = 100;

for (let i = 0; i < maxTries; i++) {

  if (rooms.length >= maxRooms) break;

  let roomWidth = Math.floor(Math.random() * 10) + 5;
  let roomHeight = Math.floor(Math.random() * 10) + 5;

  let roomX = Math.floor(Math.random() * (tilemap[0].length - roomWidth - 2)) + 1;
  let roomY = Math.floor(Math.random() * (tilemap.length - roomHeight - 2)) + 1;

  const newRoom = {
    x: roomX,
    y: roomY,
    width: roomWidth,
    height: roomHeight
  };

  // verificar colisão
  let overlap = false;

  for (let other of rooms) {
    if (roomsOverlap(newRoom, other)) {
      overlap = true;
      break;
    }
  }

  // se colidir, ignora
  if (overlap) continue;

  // escava sala
  for (let y = roomY; y < roomY + roomHeight; y++) {
    for (let x = roomX; x < roomX + roomWidth; x++) {
      tilemap[y][x] = 0;
    }
  }

  // salva sala
  rooms.push(newRoom);
}
export const positionInicialX = (rooms[0].x + Math.floor(rooms[0].width / 2)) * tile;
export const positionInicialY = (rooms[0].y + Math.floor(rooms[0].height / 2)) * tile;

function getCenter(room) {
    return {
        x: Math.floor(room.x + room.width / 2),
        y: Math.floor(room.y + room.height / 2)
    };
}

function createCorridor(a, b) {

    const start = getCenter(a);
    const end = getCenter(b);

    function dig(x, y) {
        if (tilemap[y] && tilemap[y][x] !== undefined) {
            tilemap[y][x] = 0;
        }
    }

    if (Math.random() > 0.5) {
        // horizontal → vertical

        for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
            dig(x, start.y);
            dig(x, start.y + 1); // largura 2
        }

        for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
            dig(end.x, y);
            dig(end.x + 1, y); // largura 2
        }

    } else {
        // vertical → horizontal

        for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
            dig(start.x, y);
            dig(start.x + 1, y); // largura 2
        }

        for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
            dig(x, end.y);
            dig(x, end.y + 1); // largura 2
        }
    }
}
for (let i = 0; i < rooms.length - 1; i++) {
    createCorridor(rooms[i], rooms[i + 1]);
}

export function getRandomPositionInRoom(room) {
  const x = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
  const y = room.y + 1 + Math.floor(Math.random() * (room.height - 2));

  return {
    x: x * tile,
    y: y * tile
  };
}