class Ambushment extends ActiveSkill{

    constructor(){
        super("Ambushment");
    }
    // ใช้สกิลได้เมื่อมีการ์ดสีดำอย่างน้อย 1 ใบในมือ
    canUse(player, game){
        return player.hand.cards.some(
            card => 
                card.suit === "♠️" || 
                card.suit === "♣️"
        );
    }
    canTarget(player, target){
        return player !== target;
    }
    // ต้องเลือกเป้าหมายก่อนเลือกการ์ด
    needsTarget(player, game){
        return true;
    }
    // หลังเลือกเป้าหมาย ต้องเลือกการ์ดสีดำ 1 ใบ
    needsCardSelection(player, game){
        return true;
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
    // ประมวลผล Ambushment หลังเลือกเป้าหมายและการ์ดแล้ว
    use(player, game){

        if(!player.controller.isHuman()){
            return false;
        }
        // ดึง Index ของการ์ดที่เลือก
        const selectedIndex = player.controller.selectedSkillCardIndices[0];
        // ดึงการ์ดจริงจากมือ
        const selectedCard = player.hand.cards[selectedIndex];
        //
        const target = player.controller.getSelectedTarget();
        if(!selectedCard || !target){
            return false;
        }
        // เก็บการ์ดที่เลือกไว้สำหรับ Ambushment
        player.controller.selectedAmbushmentCard = selectedCard;
        // เก็บเป้าหมายของ Ambushment
        player.controller.ambushmentTarget = target;
        // ส่งเป้าหมายเข้า Flow ถอนสะพานเดิม
        player.controller.selectedBurnTarget = target;
        // เริ่มเลือกโซนแบบถอนสะพาน
        player.controller.startBurnSourceSelection();
        console.log(
            "Ambushment Card =", 
            selectedCard.name, 
            selectedCard.suit, 
            selectedCard.number
        );
        console.log("Ambushment Target =", target.name);
        return true;
    }
    getDescription(){
        return "คุณสามารถใช้การ์ด ♠️ ♣️ เป็น [ถอนสะพาน]";
    }
}