class Lust extends ActiveSkill{

    constructor(){
        super("Lust");

        this.usedThisPlayPhase = false;
    }
    // รีเซ็ตให้ใช้ Lust ได้อีกครั้งเมื่อเริ่ม Play Phase ใหม่
    onTurnStart(player, game){
        this.usedThisPlayPhase = false;
    }
    // ใช้ได้เพียง 1 ครั้งต่อ Play Phase และต้องมีการ์ดในมือ
    canUse(player, game){
        return (
            !this.usedThisPlayPhase && 
            player.hand.cards.length > 0
        );
    }
    // Lust จะเริ่มจากการเลือกการ์ดก่อน
    needsTarget(player, game){
        return false;
    }
    // Lust ต้องเลือกการ์ด 1 ใบ
    needsCardSelection(player, game){
        return true;
    }
    // เลือกการ์ด 1 ใบ
    cardSelectionCount(player, game){
        return 1;
    }
    // หลังเลือกการ์ดแล้ว ให้ไปเลือก Target ต่อทันที
    waitForCardSelectionConfirmation(player, game){
        return false;
    }
    // รอการเลือก Target โดยยังไม่ Execute ทันที
    waitForTargetConfirmation(player, game){
        return true;
    }
    // ทดสอบการทิ้งการ์ด 1 ใบ
    use(player, game){

        if(!this.canUse(player, game)){
            return false;
        }

        const selectedIndex = player.controller.selectedSkillCardIndices[0];
        if(selectedIndex === undefined){
            return false;
        }

        const card = player.hand.cards[selectedIndex];
        if(!card){
            return false;
        }
        // ยังไม่ทิ้งการ์ด เพราะต้องรอ Target และ Confirm
        player.controller.inputState = "waitingSkillTarget";
        game.ui.render();
        return true;
    }
    getDescription(){
        return "Lust (เสน่หา)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase คุณสามารถทิ้งการ์ด 1 ใบ " +
            "เพื่อเลือกตัวละครชาย 2 คนให้ ดวลเดี่ยว กัน " +
            "คุณเป็นผู้กำหนดว่าใครจะเป็นฝ่าย โจมตี ก่อน " +
            "และผลนี้ไม่สามารถถูกยกเลิกด้วย หักล้าง"; 
    }
    
}