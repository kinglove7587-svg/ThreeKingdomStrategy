class IronChainCard extends TrickCard{
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
    use(player){
        // ดึงออบเจกต์เกมจากตัวละครผู้เล่น
        const game = player.game;
        // ดึงเป้าหมายที่เลือกผ่าน Controller
        const target = player.controller.getTarget(this);
        // หากไม่ได้เลือกเป้าหมาย หรือยกเลิก ให้ยกเลิกการทำงานของการ์ด
        if(!target){
            return false;
        }
        game.log("→ เป้าหมาย : " + target.name);
        // สลับสถานะติดโซ่ตรวนของผู้เล่นเป้าหมาย
        target.toggleChain();
        // ทำงานสำเร็จ คืนค่า true
        return true;
    }
    //
    canRecast(){
        return true;
    }
    // NEW: คำอธิบายความสามารถสำหรับ Tooltip
    getDescription(){
        return "เลือกผู้เล่น 1 คนเพื่อสลับสถานะ โซ่ตรวน ของเป้าหมาย และ ส่งต่อความเสียหายได้ ถ้าอยู่ในสถานะโซ่ตรวน";
    }
}