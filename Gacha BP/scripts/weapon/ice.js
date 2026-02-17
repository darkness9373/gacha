import { ItemStack, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import Score from "../extension/Score";
import OpenUI from '../extension/OpenUI';

/* ================= CONFIG ================= */

const GACHA_PRICE = 750;

const crateBody = [
    "Rate:",
    " - 1 Ice Bow : 2\%",
    " - 1 Shulker Box : 5\%",
    " - 1 Trident : 7\%",
    " - 1 Diamond Spear : 8\%",
    " - 1 Diamond Sword : 10\%",
    " - 1 Golden Sword : 12\%",
    " - 1 Iron Sword : 15\%",
    " - 1 Stone Sword : 18\%",
    " - 1 Copper Sword : 23\%"
];

/* ================= ITEM LIST ================= */

const GACHA_ITEM = [
    { name: "Ice Bow", id: "rex:ice", amount: 1, rate: 0.02, legend: true },
    
    { name: "Shulker Box", id: "shulker_box", amount: 1, rate: 0.05 },
    
    { name: "Trident", id: "trident", amount: 1, rate: 0.07 },
    
    { name: "Diamond Spear", id: "diamond_spear", amount: 1, rate: 0.08 },
    
    { name: "Diamond Sword", id: "diamond_sword", amount: 1, rate: 0.1 },
    
    { name: "Golden Sword", id: "golden_sword", amount: 1, rate: 0.12 },
    
    { name: "Iron Sword", id: "iron_sword", amount: 1, rate: 0.15 },
    
    { name: "Stone Sword", id: "stone_sword", amount: 1, rate: 0.18 },
    
    { name: "Copper Sword", id: "copper_sword", amount: 1, rate: 0.23 }
];

/* ================= PRICE ================= */

function getPrice(count) {
    if (count === 5) return Math.floor(GACHA_PRICE * 5 * 0.9);
    if (count === 10) return Math.floor(GACHA_PRICE * 10 * 0.85);
    return GACHA_PRICE;
}

/* ================= ROLL SYSTEM ================= */

function rollOne() {
    const r = Math.random();
    let sum = 0;
    
    for (const item of GACHA_ITEM) {
        sum += item.rate;
        if (r <= sum) return item;
    }
    
    return GACHA_ITEM[GACHA_ITEM.length - 1];
}

/* ================= EFFECT ================= */

function runRollEffect(player, callback) {
    
    // slow biar dramatis
    player.runCommand("effect @s slowness 3 4 true");
    player.runCommand('playSound custom.gacha @s')
    // particle awal
    player.runCommand("particle minecraft:portal ~ ~1 ~");
    
    
    
    let tick = 0;
    
    const loop = system.runInterval(() => {
        tick++;
        
        const fake =
            GACHA_ITEM[Math.floor(Math.random() * GACHA_ITEM.length)].name;
        
        player.onScreenDisplay.setActionBar(
            `§eRolling... §7${fake}`
        );
        
        if (tick > 30) {
            system.clearRun(loop);
            callback();
        }
    }, 2);
}

/* ================= GIVE ITEM ================= */

function giveReward(player, item) {
    
    // clear slow
    player.runCommand("effect @s clear slowness");
    
    // particle reward
    player.runCommand(
        "particle minecraft:totem_particle ~ ~1 ~"
    );
    
    if (item.legend) {
        player.playSound("random.toast", {
            volume: 1,
            pitch: 1
        });
    }
    
    try {
        const inv = player.getComponent("inventory").container;
        inv.addItem(new ItemStack(normalizeId(item.id), item.amount));
    } catch {}
    
    player.sendMessage(
        `§6Gacha Dapat: §e${item.name}`
    );
    player.onScreenDisplay.setActionBar(
        `§6Dapat: §e${item.name}`
    );
    Score.add(player, 'gacha', 1)
}

/* ================= MULTI ROLL ================= */

function doGacha(player, count) {
    
    let i = 0;
    
    function next() {
        if (i >= count) return;
        
        runRollEffect(player, () => {
            const win = rollOne();
            giveReward(player, win);
            
            i++;
            system.runTimeout(next, 20);
        });
    }
    
    next();
}

/* ================= FORM ================= */

function openChest(player) {
    const gold = Score.get(player, 'gold') ?? 0
    const form = new ActionFormData()
        .title("Gacha Ice Bow")
        .body(`Gold : ${gold}\n\n` + crateBody.join("\n"))
        .button(`1× Gacha\n§6${getPrice(1)} Gold`)
        .button(`5× Gacha\n§6${getPrice(5)} Gold`)
        .button(`10× Gacha\n§6${getPrice(10)} Gold`);
    
    form.show(player).then(r => {
        if (r.canceled) return;
        
        let count = 1;
        if (r.selection === 1) count = 5;
        if (r.selection === 2) count = 10;
        
        const price = getPrice(count);
        const gold = Score.get(player, "gold") ?? 0;
        
        if (gold < price) {
            player.sendMessage("§cGold tidak cukup!");
            return;
        }
        
        // potong gold
        Score.remove(player, "gold", price);
        
        // mulai gacha
        doGacha(player, count);
    });
}

function normalizeId(id) {
    return id.includes(':') ? id : `minecraft:${id}`
}

OpenUI.entity('weapon_ice', openChest)