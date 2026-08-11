class KnowEnemyCard extends TrickCard{
    constructor(suit, number){
        super("รู้เขารู้เรา", suit, number);
    }
    // ตรวจสอบว่าเป้าหมายสามารถถูกเลือกได้หรือไม่
    canTarget(player, target){
        // ห้ามเลือกตัวเองเป็นเป้าหมาย
        if(player === target){
            return false;
        }
        return true;
    }
    // ระบุว่าการ์ดรู้เขารู้เรา สามารถนำไป Recast (เปลี่ยนการ์ด) ได้หรือไม่
    canRecast(){
        return true;
    }
}