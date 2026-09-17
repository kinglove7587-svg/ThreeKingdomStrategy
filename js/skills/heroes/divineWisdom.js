class DivineWisdom extends ActiveSkill{

    constructor(){
        super("Divine Wisdom");

        this.usedThisPlayPhase = false;
    }
    // รีเซ็ตการใช้สกิลเมื่อเริ่ม Play Phase ใหม่
    onPlayPhase(player, game){

        if(player !== this.owner){
            return;
        }
        this.usedThisPlayPhase = false;
    }
    // ใช้ได้เฉพาะเจ้าของ Skill ใน Play Phase ของตัวเอง
    canUse(player, game){
        return (
            player === this.owner && 
            game.getCurrentPlayer() === player && 
            !this.usedThisPlayPhase && 
            player.hand.cards.length > 0
        );
    }
    // Divine Wisdom ไม่ต้องเลือก Target
    needsTarget(player, game){
        return false;
    }
    // ใช้งานสกิล
    use(player, game){

        if(!this.canUse(player, game)){
            return false;
        }

        const discardedCount = player.hand.cards.length;
        if(discardedCount === 0){
            return false;
        }
        // ทิ้งการ์ดทั้งหมดจากมือ
        while(player.hand.cards.length > 0){
            const discardedCard = player.hand.removeCard(0);
            if(!discardedCard){
                return false;
            }
            game.discardPile.addCard(discardedCard);
        }
        // ถือว่าใช้ Skill แล้วหลังจากทิ้งการ์ดสำเร็จ
        this.usedThisPlayPhase = true;
        game.log(
            player.name + " ใช้ Divine Wisdom ทิ้งการ์ด " + 
            discardedCount + " ใบ"
        );
        // ถ้าจำนวนการ์ดที่ทิ้งมากกว่า HP ปัจจุบัน ให้ฟื้น HP 1
        if(discardedCount > player.hp){
            player.recoverHp(1);
            game.log(
                player.name + " ใช้ Divine Wisdom และฟื้นฟู HP 1"
            );
        }
        return true;
    }
    getDescription(){
        return (
            "Divine Wisdom (ปัญญาเทวะ)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase ของคุณ " +
            "คุณสามารถทิ้งการ์ดในมือทั้งหมด " +
            "หากจำนวนการ์ดที่ทิ้งมากกว่า HP ของคุณ " +
            "คุณฟื้นฟู HP 1 หน่วย"
        );
    }
}