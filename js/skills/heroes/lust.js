class Lust extends ActiveSkill{

    constructor(){
        super("Lust");

    }
    //
    canUse(player, game){
        return !player.lustUsed && 
            player.hand.cards.length > 0;
    }
    //
    canTarget(player, target){
        return (
            target && 
            target.isAlive() && 
            target !== player && 
            target.gender === "male"
        );
    }
    //
    needsCardSelection(player, game){
        return true;
    }
    //
    needsTarget(player, game){
        return false;
    }
    //
    cardSelectionCount(player, game){
        return 1;
    }
    //
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    //
    use(player, game){
        // ดึง Controller ของผู้ใช้ Lust
        const controller = player.controller;
        if(!controller){
            return false;
        }
        // ดึง Index ของการ์ดที่เลือกไว้
        const selectedIndex = controller.selectedSkillCardIndices[0];
        // ดึงการ์ดจริงจากมือ
        const card = player.hand.cards[selectedIndex];
        if(!card){
            return false;
        }
        // เริ่ม Action และล็อกการทำงานไว้จนกว่า Lust จะจบ
        game.startAction();
        // สร้าง Context สำหรับเก็บการ์ดและ Target ของ Lust
        controller.lustContext = {
            card: card, 
            firstTarget: null, 
            secondTarget: null
        };
        // เปลี่ยนไปสู่ขั้นตอนเลือก Target คนที่ 1
        controller.inputState = "waitingLustFirstTarget";
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