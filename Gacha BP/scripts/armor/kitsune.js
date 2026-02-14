import { ItemStack, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import Score from "../extension/Score";
import OpenUI from '../extension/OpenUI';

/* ================= CONFIG ================= */

const GACHA_PRICE = 2000;

const crateBody = [
    "Rate:",
    " - Kitsune Mask : 5%",
    " - Shulker Box : 5%",
    " - Diamond Helmet : 7%",
    " - Diamond Chestplate : 6%",
    " - Diamond Leggings : 6%",
    " - Diamond Boots : 7%",
    " - Iron Helmet : 7%",
    " - Iron Chestplate : 7%",
    " - Iron Leggings : 7%",
    " - Iron Boots : 7%",
    " - Chainmail Helmet : 9%",
    " - Chainmail Chestplate : 9%",
    " - Chainmail Leggings : 9%",
    " - Chainmail Boots : 9%",
];

/* ================= ITEM LIST ================= */

const GACHA_ITEM = [
    { name: "Kitsune Mask", id: "rex:kitsune", amount: 1, rate: 0.05 },
    
    { name: "Shulker Box", id: "minecraft:shulker_box", amount: 1, rate: 0.05 },
    
    { name: "Diamond Helmet", id: "minecraft:diamond_helmet", amount: 1, rate: 0.07 },
    { name: "Diamond Chestplate", id: "minecraft:diamond_chestplate", amount: 1, rate: 0.06 },
    { name: "Diamond Leggings", id: "minecraft:diamond_leggings", amount: 1, rate: 0.06 },
    { name: "Diamond Boots", id: "minecraft:diamond_boots", amount: 1, rate: 0.07 },
    
    { name: "Iron Helmet", id: "minecraft:iron_helmet", amount: 1, rate: 0.07 },
    { name: "Iron Chestplate", id: "minecraft:iron_chestplate", amount: 1, rate: 0.07 },
    { name: "Iron Leggings", id: "minecraft:iron_leggings", amount: 1, rate: 0.07 },
    { name: "Iron Boots", id: "minecraft:iron_boots", amount: 1, rate: 0.07 },
    
    { name: "Chainmail Helmet", id: "minecraft:chainmail_helmet", amount: 1, rate: 0.09 },
    { name: "Chainmail Chestplate", id: "minecraft:chainmail_chestplate", amount: 1, rate: 0.09 },
    { name: "Chainmail Leggings", id: "minecraft:chainmail_leggings", amount: 1, rate: 0.09 },
    { name: "Chainmail Boots", id: "minecraft:chainmail_boots", amount: 1, rate: 0.09 },
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
    player.runCommand("effect @s slowness 4 4 true");
    
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
        
        player.playSound("block.enchanting_table.use", {
            volume: 0.9,
            pitch: 1
        });
        
        if (tick > 40) {
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
    
    player.playSound("random.orb", {
        volume: 1,
        pitch: 1.2
    });
    
    if (item.legend) {
        player.playSound("ui.toast.challenge_complete", {
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
        .title("Gacha Kitsune Mask")
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

OpenUI.entity('armor_kitsune', openChest)