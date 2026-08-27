class GodOfWar extends ActiveSkill{

    constructor(){
        super("God Of War");
    }
    // ตรวจสอบว่าสามารถใช้สกิลได้หรือไม่
    canUse(player, game){
        return player.hand.cards.some(
            card => card.suit === "♥️" || card.suit === "♦️"
        );
    }
    // ไม่ต้องเลือกเป้าหมายก่อนเลือกการ์ด
    needsTarget(player, game){
        return false;
    }
    // ต้องเลือกการ์ดจากมือ
    needsCardSelection(player, game){
        return true;
    }
    // เลือกการ์ดเพียง 1 ใบ
    cardSelectionCount(player, game){
        return 1;
    }
    // ยืนยัน และ ยกเลิก การ์ด
    waitForCardSelectionConfirmation(player, game){
        return true;
    }
    // อนุญาตให้เลือกเฉพาะการ์ดสีแดง
    canSelectSkillCard(player, card, game){
        return (card.suit === "♥️" || card.suit === "♦️");
    }
    // ประมวลผล God Of War
    use(player, game){
        return false;
    }
    getDescription(){
        return "God Of War (เทพสงคราม)\n" +
            "คุณสามารถใช้หรือเล่นการ์ดสีแดง ♥️ ♦️ แทน โจมตี ได้";
    }
}