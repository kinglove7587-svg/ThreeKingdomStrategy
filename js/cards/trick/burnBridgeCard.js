class BurnBridgeCard extends TrickCard{
    constructor(suit, number){
        super("สะพานขาด", suit, number);
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
}