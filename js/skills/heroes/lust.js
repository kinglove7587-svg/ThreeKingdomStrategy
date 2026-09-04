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
    // ขั้นแรกของ Lust: เลือกการ์ด 1 ใบเพื่อทิ้ง
    needsTarget(player, game){
        return false;
    }
    // 
    needsCardSelection(player, game){
        return true;
    }
    //
    cardSelectionCount(player, game){
        return 1;
    }
    // ชั่วคราวในขั้นทดสอบ ให้การ์ดที่เลือกถูกใช้ทันที
    waitForCardSelectionConfirmation(player, game){
        return false;
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

        const removeCard = player.hand.removeCard(selectedIndex);
        if(!removeCard){
            return false;
        }

        game.discardPile.addCard(removeCard);
        this.usedThisPlayPhase = true;
        game.log(player.name + " ใช้ Lust ทิ้ง " + removeCard.name);
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