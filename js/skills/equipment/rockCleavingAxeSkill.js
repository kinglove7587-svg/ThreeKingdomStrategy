class RockCleavingAxeSkill extends TriggerSkill{
    constructor(){
        super("ขวานผ่าศิลา");
    }
    // ผูก Event Listener 'beforeSlashHit' เมื่อสวมใส่อาวุธ
    register(eventManager, player){
        this.registerListener(
            eventManager, 
            "beforeSlashHit", 
            this.onBeforeSlashHit.bind(this, player)
        );
    }
    // ดักจับช่วงเวลาก่อนที่ Slash จะแสดงผลความเสียหาย (กรณีถูกหลบ)
    onBeforeSlashHit(player, context){
        // ทำงานเฉพาะตอน Slash กำลังจะถูกยกเลิก
        if(!context.canceled){
            return;
        }
        // ต้องมีการ์ดอย่างน้อย 2 ใบจึงใช้ขวานได้
        if(player.hand.cards.length < 2){
            return;
        }
        
        if(player.controller instanceof HumanController){
            // หยุด Slash เดิมไว้ระหว่างรอการตัดสินใจ
            context.waitingTrigger = true;
            
            player.controller.startTriggerChoice(this, 
                {
                    slashContext: context
                }
            );
        }
    }
    // ประมวลผลคำตอบของผู้เล่นว่าต้องการใช้ขวานผ่าศิลาหรือไม่
    resolveChoice(player, game, context, useSkill){
        const slashContext = context.slashContext;
        
        if(!useSkill){
            // ไม่ใช้ขวาน ให้ Slash ถูกยกเลิกตามเดิม
            slashContext.waitingTrigger = false;

            game.log(player.name + " ไม่ใช้ ขวานผ่าศิลา");

            return slashContext.resume();
        }
        // เลือกการ์ด 2 ใบเพื่อใช้ขวาน
        player.controller.startTriggerCardSelection(this, context);

        return true;
    }
    // คืนค่าจำนวนการ์ดที่ต้องเลือกทิ้งสำหรับสกิลนี้ (2 ใบ)
    triggerCardSelectionCount(player, game){
        return 2;
    }
    // ประมวลผลการทิ้งการ์ด 2 ใบ และยกเลิกการหลบเพื่อให้โจมตีโดนเป้าหมาย
    resolveTriggerCards(player, game, context){
        // ตรวจสอบว่ามีการ์ดส่งมาครบ 2 ใบหรือไม่
        if(!context.cards || context.cards.length !== 2){
            return false;
        }
        // หาตำแหน่ง Index ของการ์ดที่เลือกบนมือผู้เล่น
        const indices = context.cards.map(
            card => player.hand.cards.indexOf(card)
        );
        
        if(indices.includes(-1)){
            return false;
        }
        // เรียงลำดับ Index จากมากไปน้อย เพื่อถอดการ์ดออกจากอาร์เรย์ได้อย่างถูกต้อง
        const sortedIndices = [...indices].sort((a, b) => b - a);
        
        for(const index of sortedIndices){
            const card = player.hand.removeCard(index);
            
            if(!card){
                return false;
            }
            // นำการ์ดที่ทิ้งลงกองทิ้ง
            game.discardPile.addCard(card);
        }
        // ยกเลิกสถานะ Cancel แล้วให้ Slash เดิมทำงานต่อ
        context.slashContext.canceled = false;
        context.slashContext.waitingTrigger = false;

        game.log(player.name + 
            " ใช้ ขวานผ่าศิลา บังคับให้โจมตีโดน " + 
            context.slashContext.target.name
        );

        return context.slashContext.resume();
    }
}