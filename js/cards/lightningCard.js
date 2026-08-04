class LightningCard extends DelayedTrickCard{
    // กำหนดชื่อการ์ดเป็น "สายฟ้า" พร้อมรับดอก/สี (suit) และตัวเลขหน้าไพ่ (number)
    constructor(suit, number){
        super("สายฟ้า", suit, number);
    }
    // เช็กเงื่อนไขเป้าหมาย โดยการ์ดสายฟ้าจะวางใส่หน้าตัวเองเท่านั้น (player === target)
    canTarget(player, target){
        console.log("canTarget", player.name, target.name); // Debug
        return player === target;
    }
    // ใช้งานการ์ดสายฟ้า
    use(player, game){
        console.log("Lightning.use()"); // Debug
        // ให้ Controller เลือกเป้าหมายสำหรับการวางสายฟ้า
        const target = player.controller.getTarget(this);
        // หากไม่ได้เลือกเป้าหมาย หรือยกเลิก ให้ยกเลิกการใช้งานการ์ด
        if (target === null){
            return false;
        }
        // เพิ่มการ์ดสายฟ้าเข้าไปในโซนการ์ดหน่วงเวลา (Delayed Trick) ของเป้าหมาย
        target.addDelayedTrick(this);
        // แสดงรายการการ์ดหน่วงเวลาทั้งหมดที่ติดอยู่หน้าตัวละคร
        target.showDelayedTrick();
        game.log(player.name + " วางสายฟ้า");
        // คืนค่า true แสดงว่าใช้งานการ์ดสำเร็จ
        return true;
    }
}