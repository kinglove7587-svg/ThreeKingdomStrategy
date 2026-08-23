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
}