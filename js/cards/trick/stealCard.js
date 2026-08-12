class StealCard extends TrickCard{
    constructor(suit, number){
        super("ฉกฉวย", suit, number);
    }
    // กำหนดว่าการ์ดนี้ต้องเลือกเป้าหมาย
    needTarget(){
        return true;
    }
    // ตรวจสอบว่าสามารถเลือกเป้าหมายนี้ได้หรือไม่
    canTarget(player, target){
        // ห้ามเลือกตัวเอง
        if(player === target){
            return false;
        }
        // ต้องมีไพ่บนมืออย่างน้อย 1 ใบ หรือสวมใส่อาวุธอยู่ ถึงจะเล็งเป้าได้
        if(
            target.hand.cards.length === 0 && 
            !target.weapon
        ){
            return false;
        }
        // ระยะห่าง (Distance) ต้องไม่เกิน 1
        return player.game.getDistance(player, target) <= 1;
    }
    // ประมวลผลการใช้การ์ดฉกฉวย (Steal)
    use(player, game){
        // ดึงตัวควบคุม (Controller) ของผู้เล่นที่กำลังใช้การ์ด
        const controller = player.controller;
        // บันทึกเป้าหมายที่เลือกไว้ลงใน selectedStealTarget
        controller.selectedStealTarget = controller.getSelectedTarget();
        // เริ่มเข้าสู่โหมดรอเลือกแหล่งการ์ดที่จะขโมย (มือ หรือ อาวุธ)
        controller.startStealSourceSelection();
        return true;
    }
}