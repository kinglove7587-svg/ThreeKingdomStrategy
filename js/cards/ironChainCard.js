class IronChainCard extends Card{
    // กำหนดชื่อการ์ด "โซ่ตรวน" พร้อมส่ง ดอก (suit) และ ตัวเลข (number) ให้กับ TrickCard
    constructor(suit, number){
        super("โซ่ตรวน", suit, number);
    }
    // ระบุว่าการ์ดใบนี้จำเป็นต้องเลือกเป้าหมายในการใช้งาน
    needTarget(){
        return true;
    }
    // กำหนดให้สามารถเลือกเป้าหมายเป็นใครก็ได้ (รวมถึงตัวเอง)
    canTarget(source, target){
        return true;
    }
    // ประมวลผลเมื่อผู้เล่นใช้งานการ์ดโซ่ตรวน
    use(player, target){
        player.game.log(player.name + " ใช้โซ่ตรวน ใส่ " + target.name);
        // สลับสถานะติดโซ่ตรวนของผู้เล่นเป้าหมาย
        target.toggleChain();
        //
        return true;
    }
}