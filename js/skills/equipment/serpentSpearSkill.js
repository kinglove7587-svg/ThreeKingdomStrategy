class SerpentSpearSkill extends ActiveSkill{
    constructor(){
        super("ง้าวอสรพิษ");
    }
    // กำหนดจำนวนการ์ดที่ต้องเลือกทิ้งจากมือ (ง้าวอสรพิษใช้การ์ด 2 ใบ)
    cardSelectionCount(player, game){
        return 2;
    }
    // ตรวจสอบเงื่อนไขว่าผู้เล่นมีการ์ดบนมืออย่างน้อย 2 ใบหรือไม่
    canUse(player, game){
        return player.hand.cards.length >= 2;
    }
    // สกิลนี้ต้องการการเลือกเป้าหมายผู้เล่น
    needsTarget(player, game){
        return true;
    }
    // สกิลนี้ต้องการการเลือกการ์ดจากบนมือ
    needsCardSelection(player, game){
        return true;
    }
    // ตรวจสอบว่าเป้าหมายอยู่ในระยะการโจมตีของอาวุธหรือไม่
    canTarget(player, target){
        if(player === target){
            return false;
        }
        
        const distance = player.game.getAttackDistance(player, target);
        return distance <= player.getWeaponRange();
    }
    // ประมวลผลการใช้สกิล (ทิ้งการ์ด 2 ใบเพื่อร่าย Slash เสมือน)
    use(player, game){
        if(!this.canUse(player,game)){
            return false;
        }
        
        const indices = player.controller.selectedSkillCardIndices;
        
        if(!indices || indices.length !== 2){
            return false;
        }
        // ป้องกันการเลือก Index การ์ดใบเดียวกันซ้ำ
        if(new Set(indices).size !== 2){
            return false;
        }
        // ตรวจสอบว่า Index ทั้งหมดอยู่ในขอบเขตการ์ดบนมือจริง
        for(const index of indices){
            if(index < 0 || index >= player.hand.cards.length){
                return false;
            }
        }
        // เรียงลำดับ Index จากมากไปน้อย เพื่อป้องกัน Index เลื่อนเวลานำการ์ดออกจากมือ
        const sortedIndices = [...indices].sort((a, b) => b - a);
        
        for(const index of sortedIndices){
            const card = player.hand.removeCard(index);
            if(!card){
                return false;
            }
            game.discardPile.addCard(card);
        }
        // สร้าง SlashCard เสมือนขึ้นมา 1 ใบ
        const slash = new SlashCard("♠️", 1);

        game.log(player.name + " ใช้สกิล ง้าวอสรพิษ");
        // เรียกใช้ผลของ SlashCard
        return slash.use(player, game);
    }
}