class KirinBowSkill extends TriggerSkill{
    constructor(){
        super("กิเลนคันธนู");
    }
    // ผูก Event Listener 'afterDamage' เมื่อผู้เล่นสวมใส่อาวุธนี้
    register(eventManager, player){
        this.registerListener(eventManager, "afterDamage", 
            this.onAfterDamage.bind(this, player)
        );
    }
    // ผูก Event Listener 'afterDamage' เมื่อผู้เล่นสวมใส่อาวุธนี้
    onAfterDamage(player, damage, resolution){
        if(!player){
            return;
        }
        // ต้องเป็นการสร้างความเสียหายด้วย SlashCard
        if(!(damage.card instanceof SlashCard)){
            return;
        }
        // ต้องเป็นผู้สวมใส่อาวุธนี้ที่เป็นผู้ทำความเสียหาย
        if(damage.source !== player){
            return;
        }
        
        const target = damage.target;
        // เป้าหมายต้องมี Mount (ม้า) สวมใส่อยู่
        if(!target || !target.mount){
            return;
        }
        // กรณีเป็น Human Controller ให้ถามผู้เล่นว่าต้องการใช้สกิลหรือไม่
        if(player.controller instanceof HumanController){
            if(resolution){
                resolution.wait();
            }
            player.controller.startTriggerChoice(this, 
                {
                    damage: damage, 
                    target: target, 
                    resolution: resolution
                }
            );
            return;
        }
        // TODO: สำหรับ AI
    }
    // ประมวลผลคำตอบของผู้เล่น (กดใช้ / ไม่ใช้)
    resolveChoice(player, game, context, useSkill){
        const resolution = context.resolution;
        // หากผู้เล่นเลือก "ไม่ใช้"
        if(!useSkill){
            game.log(player.name + " ไม่ใช้ กิเลนคันธนู");
            if(resolution){
                resolution.resume();
            }
            return false;
        }
        
        if(!context || !context.target){
            if(resolution){
                resolution.resume();
            }
            return false;
        }
        
        const target = context.target;
        
        if(!target.mount){
            if(resolution){
                resolution.resume();
            }
            return false;
        }
        // ถอดม้าของเป้าหมายออก
        const mount = target.unequipMount();
        
        if(!mount){
            if(resolution){
                resolution.resume();
            }
            return false;
        }
        // สั่งทำงาน Hook ตอนถอดม้า และนำม้าส่งลงกองทิ้ง (Discard Pile)
        mount.onUnequip(target);
        game.discardPile.addCard(mount);

        game.log(player.name + "ใช้ กิเลนคันธนู ทิ้ง " + 
            mount.name + " ของ " + target.name
        );
        if(resolution){
            resolution.resume();
        }
        return true;
    }
}