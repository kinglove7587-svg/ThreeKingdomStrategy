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
}