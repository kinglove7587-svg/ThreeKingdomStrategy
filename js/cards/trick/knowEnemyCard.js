class KnowEnemyCard extends TrickCard{
    constructor(suit, number){
        super("รู้เขารู้เรา", suit, number);
    }
    // ระบุว่าการ์ดใบนี้จำเป็นต้องเลือกเป้าหมายก่อนใช้งานหรือไม่
    needTarget(){
        return true;
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
    // สั่งใช้งานการ์ดรู้เขารู้เรา โดยดึงเป้าหมายที่ถูกเลือก และเปิดดูการ์ดบนมือของเป้าหมายนั้น
    use(player, game){
        // ดึงออบเจกต์เป้าหมายที่ถูกเลือกจาก Controller
        const target = player.controller.getSelectedTarget();
        // หากไม่ได้เลือกเป้าหมาย ให้คืนค่า false เพื่อยกเลิกการใช้การ์ด
        if(!target){
            return false;
        }
        // สั่งให้ Controller เริ่มต้นสถานะเปิดดูการ์ดบนมือของเป้าหมาย
        player.controller.startViewingHand(target);
        return true;
    }
}