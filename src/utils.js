import { dataItens } from "./data/dataItens.js";
import { ITEMS } from "./itens.js";

// #Funções auxiliares
export let tile = 32;

const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    attackArc: false,
    pegarItem: false,
}

export function getItens(engine, ctx, x, y, camera) {
    const categorias = Object.values(dataItens);
    const categoria = categorias[x];
  
    if (!categoria) return;
  
    const itens = Object.values(categoria);
    const item = itens[y];
  
    if (!item) return;
  
    const drop = new ITEMS(engine, item.id);
  
    return drop;
}
export default keys;