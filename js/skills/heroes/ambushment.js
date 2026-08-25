class Ambushment extends ActiveSkill{

    constructor(){
        super("Ambushment");
        // ใช้ติดตามว่าเลือกการ์ดสำหรับ Ambushment แล้วหรือยัง
        this.cardSelected = false;
    }
    // ใช้สกิลได้เมื่อมีการ์ดสีดำอย่างน้อย 1 ใบในมือ
    canUse(player, game){
        return player.hand.cards.some(
            card => 
                card.suit === "♠️" || 
                card.suit === "♣️"
        );
    }
    // ต้องเลือกการ์ดก่อน จึงยังไม่เลือกเป้าหมายในขั้นแรก
    needsTarget(player, game){
        return false;
    }
    // หลังเลือกการ์ดแล้วไม่ต้องกลับมาเลือกการ์ดซ้ำ
    needsCardSelection(player, game){
        return !this.cardSelected;
    }
    // เลือกการ์ดเพียง 1 ใบ
    cardSelectionCount(player, game){
        return 1;
    }
    // เลือกแล้วใช้ทันที ไม่ต้องมีปุ่มยืนยัน
    waitForCardSelectionConfirmation(player, game){
        return false;
    }
    // อนุญาตให้เลือกเฉพาะการ์ดสีดำ
    canSelectSkillCard(player, card, name){
        return (
            card.suit === "♠️" || 
            card.suit === "♣️"
        );
    }
    // หลังเลือกการ์ด ให้เปลี่ยนไปเลือกเป้าหมาย
    use(player, game){

        if(!player.controller.isHuman()){
            return false;
        }
        // ดึง Index ของการ์ดที่เลือก
        const selectedIndex = player.controller.selectedSkillCardIndices[0];
        // ดึงการ์ดจริงจากมือ
        const selectedCard = player.hand.cards[selectedIndex];
        if(!selectedCard){
            return false;
        }
        // บันทึกว่าเลือกการ์ดสำหรับ Ambushment แล้ว
        this.cardSelected = true;
        // เก็บการ์ดที่เลือกไว้สำหรับ Ambushment
        player.controller.selectedAmbushmentCard = selectedCard;
        // เปลี่ยนไปขั้นเลือกเป้าหมาย
        player.controller.startSkillTargetSelection(this);
        return true;
    }
    getDescription(){
        return "คุณสามารถใช้การ์ด ♠️ ♣️ เป็น [ถอนสะพาน]";
    }
}