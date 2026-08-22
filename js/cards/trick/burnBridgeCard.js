class BurnBridgeCard extends TrickCard{
    constructor(suit, number){
        super("ถอนสะพาน", suit, number);
    }
    // ระบุว่าการ์ดใบนี้ต้องเลือกเป้าหมายก่อนใช้
    needTarget(){
        return true;
    }
    // ตรวจสอบเป้าหมายของถอนสะพาน
    canTarget(player, target){
        // ห้ามเลือกตัวเอง
        if(player === target){
            return false;
        }
        // ต้องมีการ์ดอย่างน้อย 1 ใบให้ทิ้งได้
        if(
            target.hand.cards.length === 0 && 
            !target.weapon && 
            !target.armor && 
            !target.mount && 
            target.delayedTricks.length === 0
        ){
            return false;
        }
        return true;
    }
    // ประมวลผลการใช้งานการ์ดถอนสะพาน (BurnBridgeCard)
    use(player, game){
        // ดึงตัวควบคุม (Controller) ของผู้เล่นที่กำลังใช้การ์ด
        const controller = player.controller;
        // บันทึกเป้าหมายที่เลือกไว้ลงใน selectedBurnTarget
        controller.selectedBurnTarget = controller.getSelectedTarget();
        controller.selectedCardIndex = -1;
        // เริ่มเข้าสู่โหมดรอเลือกโซนที่จะทำลาย (มือ / อาวุธ / เกราะ)
        controller.startBurnSourceSelection();
        return true;
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "เลือกผู้เล่นอื่นที่อยู่ห่างไม่เกิน 1 แล้วเลือกทำลายการ์ดจากมือ อาวุธ ม้า หรือเกราะของเป้าหมาย";
    }
}