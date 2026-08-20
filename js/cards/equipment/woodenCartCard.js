class WoodenCartCard extends EquipmentCard{

    constructor(suit, number){
        super("รถไม้", suit, number);
    }
    // กำหนดว่าการ์ดนี้ต้องเลือกเป้าหมาย
    needTarget(){
        return true;
    }
    // เริ่มใช้งานการ์ดรถไม้ (Wooden Cart) โดยตั้งค่า Pending State และเปลี่ยนสถานะให้ผู้เล่นเลือกการ์ดที่จะมอบ
    use(player, game){
        // ตรวจสอบว่าเคยใช้รถไม้ใน Play Phase นี้ไปแล้วหรือยัง
        if(player.woodenCartUsed){
            game.log(player.name + " รถไม้ใช้ไปแล้วใน Play Phase นี้");
            return false;
        }    
        // ดึงผู้เล่นเป้าหมายที่เลือกไว้ผ่าน waitingTarget
        const controller = player.controller;
        controller.selectedWoodenCartTarget = controller.getSelectedTarget();
        if(!controller.selectedWoodenCartTarget){
            return false;
        }
        // บันทึกอ้างอิงรถไม้ใบที่กำลังใช้ และเตรียม State สำหรับรอเลือกการ์ดที่จะมอบ
        controller.pendingWoodenCart = this;
        controller.selectedWoodenCartCard = null;
        controller.inputState = "waitingWoodenCartCard";
        game.ui.render();
        return true;
    }
    getDescription(){
        return "เลือกการ์ด 1 ใบจากมือและมอบให้ผู้เล่นอื่น";
    }
}