import { ItemStack, Player, world } from '@minecraft/server'
import { ActionFormData } from '@minecraft/server-ui';

const gacha1 = 2000

const crateBody = [
    'Rate :',
    ' - Ice Bow : 2%',
    ' - Soul Staff : 2%',
    ' - Darkness Sickle : 2%',
    ' - Shadow Kunai : 3%',
    ' - Blue Flame Dragon : 3%',
    '',
    ' - Shulker'
]

const GACHA_ITEM = [
    { name: 'Darkness Sickle', id: 'rex:darkn', amount: 1, rate: 0.02 },
    { name: 'Ice Bow', id: 'rex:ice', amount: 1, rate: 0.02 },
    { name: 'Soul Staff', id: 'rex:soul', amount: 1, rate: 0.02 },
    { name: 'Shadow Kunai', id: 'drk:shadow', amount: 1, rate: 0.03 },
    { name: 'Blue Flame Dragon', id: 'rex:darkn', amount: 1, rate: 0.02 }
]

function rollOne() {
    const r = Math.random()
    let sum = 0

    for (const item of GACHA_ITEM) {
        sum += item.rate
        if (r < sum) {
            return item
        }
    }

    //fallback
    return GACHA_ITEM[GACHA_ITEM.length - 1]
}

function multiRoll(items, count) {
    const result = []

    for (let i = 0; i < count; i++) {
        result.push(rollOne())
    }
    return result
}

function getPrice(count = 1) {
    const base = gacha1
    if (count == 5) return base * 5 * 0.9
    if (count == 10) return base * 10 * 0.85
    return base
}

function openChest(player) {
    const form = new ActionFormData()
    form.title('Weapon Gacha'),
    form.body(
        crateBody.join('\n')
    )
    form.button('1x Gacha' + `\nPrice : ${getPrice(1)}`)
    form.button('5x Gacha' + `\nPrice : ${getPrice(5)}`)
    form.button('10x Gacha' + `\nPrice : ${getPrice(10)}`)
    form.show(player).then(r => {
        if (r.canceled) return
        if (r.selection == 0) {
            //1 gacha
        } else if (r.selection == 1) {
            //5 gacha
        } else if (r.selection == 2) {
            //10 gacha
        }
    })
}

