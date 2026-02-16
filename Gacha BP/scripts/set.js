import { world, Player } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';

world.afterEvents.entityHitEntity.subscribe(data => {
  const player = data.damagingEntity
  const chest = data.hitEntity
  if (!(player instanceof Player)) return
  
  const inv = player.getComponent('inventory').container
  if (chest.typeId === 'drk:gacha_weapon' || chest.typeId === 'drk:gacha_armor') {
    if (!player.hasTag('admin')) return
    const hand = inv.getItem(player.selectedSlotIndex)
    if (!hand) return
    if (hand.typeId !== 'minecraft:stick') return
    if (hand.nameTag === 'gacha') {
      setting(player, chest)
    }
  }
})

function setting(player, chest) {
  let tagList
  if (chest.typeId === 'drk:gacha_weapon') {
    tagList =
      'List:' +
      '\n- Shadow Kunai: weapon_shadow' +
      '\n- Ice Bow: weapon_ice' +
      '\n- Soul Staff: weapon_soul' +
      '\n- Blue Flame: weapon_bluf' +
      '\n- Darkness Sickle: weapon_darkn' +
      '\n\nTag'
  } else {
    tagList =
      'List:' +
      '\n- Darkness Chestplate: armor_darkro' +
      '\n- Chaos Chestplate: armor_chaos' +
      '\n- Kitsune Mask: armor_kitsune' +
      '\n- Steel Hat: armor_steel' +
      '\n- Straw Hat: armor_straw' +
      '\n\nTag'
  }
  const cname = chest.nameTag ?? ''
  const form = new ModalFormData()
  form.title('Setting Chest')
  form.textField('Name', 'Shadow Kunai', { defaultValue: cname })
  form.textField(tagList, 'weapon_shadow / armor_chaos')
  form.show(player).then(r => {
    if (r.canceled) return
    const en = player.dimension.spawnEntity(
      chest.typeId,
      chest.location
    )
    if (!en) return
    const [name, tag] = r.formValues
    if (name.trim()) {
      en.nameTag = name.replace(/\\n/g, '\n')
    }
    const tags = tag.split(',').map(t => t.trim()).filter(Boolean)
    for (const tg of tags) {
      en.addTag(tag)
    }
    chest.remove()
  })
}