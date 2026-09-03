class Lust extends ActiveSkill{

    constructor(){
        super("Lust");
        
        this.selectedCard = null;
        this.firstTarget = null;
        this.secondTarget = null;
        this.usedThisPhase = false;
    }
    // เริ่มเทิร์นใหม่ ให้สามารถใช้ Lust ได้อีกครั้ง
    onTurnStart(player, game){

        this.usedThisPhase = false;
        this.selectedCard = null;
        this.firstTarget = null;
        this.secondTarget = null;
    }
    // ใช้ Lust ได้เมื่อยังไม่เคยใช้ และมีการ์ดในมืออย่างน้อย 1 ใบ
    canUse(player, game){
        return (
            !this.usedThisPhase && 
            player.hand.cards.length > 0
        );
    }
    // หลังเลือกการ์ดแล้ว จึงเข้าสู่ขั้นตอนเลือก Target
    needsTarget(player, game){
        return this.selectedCard !== null;
    }
    // ต้องเลือกการ์ดก่อนเริ่มเลือก Target
    needsCardSelection(player, game){
        return this.selectedCard === null;
    }
    // Lust ใช้การ์ด 1 ใบเป็นค่าใช้จ่าย
    cardSelectionCount(player, game){
        return 1;
    }
    // อนุญาตให้เลือกการ์ดใดก็ได้จากมือ
    canSelectSkillCard(player, card, game){
        return true;
    }
    // ตรวจสอบ Target ของ Lust
    canTarget(player, target){
        // ต้องมี Target และต้องเป็นตัวละครที่ยังมีชีวิต
        if(!target || !target.isAlive()){
            return false;
        }
        // ห้ามเลือกตัวเอง
        if(target === player){
            return false;
        }
        // Lust เลือกได้เฉพาะตัวละครเพศชาย
        if(target.gender !== "male"){
            return false;
        }
        // ถ้าเลือกคนแรกไปแล้ว คนที่สองห้ามเป็นคนเดิม
        if(this.firstTarget && target === this.firstTarget){
            return false;
        }
        return true;
    }
    // เมื่อมี firstTarget แล้ว UI จึงแสดงปุ่ม "ยืนยัน"
    waitForTargetConfirmation(player, game){
        return this.firstTarget !== null;
    }
    // ประมวลผล Lust แบบหลายขั้นตอน
    use(player, game){

        const controller = player.controller;
        // ตรวจสอบเงื่อนไขหลักทุกครั้งก่อนประมวลผล
        if(!this.canUse(player, game)){
            return false;
        }
        // หลังเลือกการ์ด ให้เก็บการ์ดไว้ก่อน
        if(this.selectedCard === null){

            const selectedIndex = controller.selectedSkillCardIndices[0];
            if(selectedIndex === undefined || selectedIndex < 0){
                return false;
            }

            const selectedCard = player.hand.cards[selectedIndex];
            if(!selectedCard){
                return false;
            }
            this.selectedCard = selectedCard;
            // เตรียมเข้าสู่การเลือกตัวละครคนแรก
            this.firstTarget = null;
            this.secondTarget = null;
            controller.selectedTarget = null;
            controller.inputState = "waitingSkillTarget";
            game.ui.render();
            return true;
        }
        // หลังเลือกชายคนแรก ให้บันทึกเป็นฝ่ายโจมตี
        if(this.firstTarget === null){

            const target = controller.getSelectedTarget();
            if(!target){
                return false;
            }
            if(!this.canTarget(player, target)){
                return false;
            }
            this.firstTarget = target;
            // ล้าง Target ใน Controller
            controller.selectedTarget = null;
            controller.inputState = "waitingSkillTarget";
            game.ui.render();
            return true;
        }
        // หลังเลือกชายคนที่สองและกด "ยืนยัน"
        const secondTarget = controller.getSelectedTarget();
        if(!secondTarget){
            return false;
        }
        if(!this.canTarget(player, secondTarget)){
            return false;
        }
        this.secondTarget = secondTarget;
        // ตรวจสอบ Target ทั้งสองก่อน Execute
        if(
            !this.firstTarget || 
            !this.secondTarget || 
            this.firstTarget === this.secondTarget
        ){
            return false;
        }
        // ตรวจสอบว่าการ์ดต้นฉบับยังอยู่ในมือ
        const cardIndex = player.hand.cards.indexOf(this.selectedCard);
        if(cardIndex === -1){
            return false;
        }
        // นำการ์ดที่ใช้เป็นค่าใช้จ่ายออกจากมือ
        const removeCard = player.hand.removeCard(cardIndex);
        if(!removeCard){
            return false;
        }
        // นำการ์ดลงกองทิ้ง
        game.discardPile.addCard(removeCard);
        game.log(
            player.name + " ใช้ Lust เลือก " + 
            this.firstTarget.name + " เป็นฝ่ายโจมตี และ " + 
            this.secondTarget.name + " เป็นฝ่ายรับ"
        );
        // ส่ง secondTarget เป็น attacker parameter
        game.duel(
            this.secondTarget, 
            this.firstTarget
        );
        // ใช้ Lust สำเร็จแล้ว
        this.usedThisPhase = true;
        // คืน State ให้ Controller เพื่อป้องกัน UI ค้าง
        if(controller){
            controller.inputState = "idle";
            controller.selectedSkillCardIndices = [];
            controller.selectedTarget = null;
        }
        // ล้าง State ของ Lust หลัง Execute
        this.selectedCard = null;
        this.firstTarget = null;
        this.secondTarget = null;
        return true;
    }
    getDescription(){
        return "Lust\n" +
            "จำกัด 1 ครั้งต่อ Play Phase\n" +
            "ทิ้งการ์ด 1 ใบ แล้วเลือกตัวละครชาย 2 คนเพื่อ Duel\n" +
            "คุณเป็นผู้กำหนดว่าใครเป็นฝ่ายโจมตีคนแรก\n" +
            "ไม่สามารถใช้ [Negation] ยกเลิกได้";
    }
}