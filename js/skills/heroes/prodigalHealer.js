class ProdigalHealer extends ActiveSkill{

    constructor(){
        super("Prodigal Healer");
        // เก็บสถานะว่าใช้สกิลไปแล้วใน Play Phase นี้หรือยัง
        this.usedThisPlayPhase = false;
    }
    // เริ่มเทิร์นใหม่ให้สามารถใช้ Prodigal Healer ได้อีกครั้ง
    onTurnStart(player, game){
        this.usedThisPlayPhase = false;
    }
    // ใช้ได้เมื่อยังไม่เคยใช้และมีการ์ดในมืออย่างน้อย 1 ใบ
    canUse(player, game){
        return(
            !this.usedThisPlayPhase && 
            player.hand.cards.length > 0
        );
    }
    // Prodigal Healer ต้องเลือกเป้าหมาย
    needsTarget(player, game){
        return true;
    }
    // เลือกได้เฉพาะตัวละครที่ยังมีชีวิตและ HP ไม่เต็ม
    canTarget(player, target){
        return (
            target && 
            target.isAlive() && 
            target.hp < target.maxHp
        );
    }
    // Prodigal Healer ต้องเลือกการ์ดจากมือ
    needsCardSelection(player, game){
        return true;
    }
    // Prodigal Healer เลือกการ์ดเพียง 1 ใบ
    cardSelectionCount(player, game){
        return 1;
    }
    // รอยืนยันหลังเลือกการ์ด
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    // ประมวลผลการใช้ Prodigal Healer
    use(player, game){
        // ตรวจสอบว่ายังสามารถใช้สกิลได้หรือไม่
        if(!this.canUse(player, game)){
            return false;
        }
        // ดึง Target ที่เลือกไว้
        const target = player.controller.getSelectedTarget();
        // ดึง Index ของการ์ดที่เลือก
        const selectedIndex = player.controller.selectedSkillCardIndices[0];
        // ตรวจสอบ Target และ Index
        if(!target || selectedIndex === undefined){
            return false;
        }
        // ตรวจสอบ Target อีกครั้ง
        if(!this.canTarget(player, target)){
            return false;
        }
        // ดึงการ์ดจากมือ
        const card = player.hand.cards[selectedIndex];
        if(!card){
            return false;
        }
        // เอาการ์ดออกจากมือ
        const removeCard = player.hand.removeCard(selectedIndex);
        if(!removeCard){
            return false;
        }
        // ฟื้น HP ให้ Target 1
        target.recoverHp(1);
        // นำการ์ดที่ทิ้งลง Discard Pile
        game.discardPile.addCard(removeCard);
        // บันทึกว่าใช้ Prodigal Healer ไปแล้วใน Play Phase นี้
        this.usedThisPlayPhase = true;
        game.log(player.name + " ใช้ Prodigal Healer กับ " + target.name);
        return true;
    }
}