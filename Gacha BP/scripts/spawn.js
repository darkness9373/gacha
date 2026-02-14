import { world } from "@minecraft/server";

const GACHA_IDS = [
  "drk:gacha_weapon",
  "drk:gacha_armor"
];

// Hitung rotasi 4 arah
function getCardinalRotation(from, to) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  
  // Bandingkan dominan sumbu
  if (Math.abs(dx) > Math.abs(dz)) {
    // Timur / Barat
    return dx > 0 ? 270 : 90;
  } else {
    // Selatan / Utara
    return dz > 0 ? 0 : 180;
  }
}

world.afterEvents.entitySpawn.subscribe(ev => {
  const entity = ev.entity;
  
  if (!GACHA_IDS.includes(entity.typeId)) return;
  
  try {
    const pos = entity.location;
    const dim = entity.dimension;
    
    // Cari player terdekat
    const players = dim.getPlayers({
      location: pos,
      maxDistance: 4
    });
    
    if (players.length === 0) return;
    
    const nearest = players[0];
    
    const yaw = getCardinalRotation(pos, nearest.location);
    
    // Teleport ke posisi sendiri tapi dengan rotasi baru
    entity.tryTeleport(
      pos,
      {
        dimension: dim,
        rotation: { x: 0, y: yaw }
      }
    );
    
  } catch (e) {
    console.warn("Gacha rotation error:", e);
  }
});