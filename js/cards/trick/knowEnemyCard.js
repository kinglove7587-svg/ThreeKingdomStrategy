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
}