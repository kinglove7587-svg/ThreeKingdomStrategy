class RationsDepletedCard extends DelayedTrickCard{
    constructor(suit, number){
        super("เสบียงหมด!", suit, number);
    }
    // ตรวจสอบว่าเป้าหมายสามารถถูกใช้การ์ดใบนี้ใส่ได้หรือไม่
    canTarget(player, target){
        // ห้ามเลือกตัวเองเป็นเป้าหมาย
        if(player === target){
            return false;
        }
        // เป้าหมายต้องอยู่ในระยะทางกายภาพ
        return player.game.getDistance(player, target) <= 1;
    }
}