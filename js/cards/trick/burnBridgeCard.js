class BurnBridgeCard extends TrickCard{
    constructor(suit, number){
        super("ถอนสะพาน", suit, number);
    }
    // ระบุว่าการ์ดใบนี้ต้องเลือกเป้าหมายก่อนใช้
    needTarget(){
        return true;
    }
    // ตรวจสอบว่าเป้าหมายอยู่ในระยะที่เลือกได้หรือไม่ (ห้ามเลือกตัวเอง และระยะห่างไม่เกิน 1)
    canTarget(player, target){
        if(player === target){
            return false;
        }
        return player.game.getDistance(player, target) <= 1;
    }
    // ประมวลผลการใช้งานการ์ดถอนสะพาน (BurnBridgeCard)
    use(player, game){
        // ดึงตัวควบคุม (Controller) ของผู้เล่นที่กำลังใช้การ์ด
        const controller = player.controller;
        // บันทึกเป้าหมายที่เลือกไว้ลงใน selectedBurnTarget
        controller.selectedBurnTarget = controller.getSelectedTarget();
        // เริ่มเข้าสู่โหมดรอเลือกโซนที่จะทำลาย (มือ / อาวุธ / เกราะ)
        controller.startBurnSourceSelection();
        return true;
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "เลือกผู้เล่นอื่นที่อยู่ห่างไม่เกิน 1 แล้วเลือกทำลายการ์ดจากมือ อาวุธ หรือเกราะของเป้าหมาย";
    }
}