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
        // ระยะห่าง (Distance) ต้องไม่เกิน 1
        return player.game.getDistance(player, target) <= 1;
    }
}