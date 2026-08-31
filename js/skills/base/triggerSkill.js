class TriggerSkill extends Skill{
    // สร้างสกิลที่ถูกเรียกใช้โดยอัตโนมัติเมื่อเหตุการณ์เกิดขึ้น
    constructor(name){
        super(name); // เรียกใช้ constructor ของคลาสแม่ (Skill) เพื่อกำหนดชื่อสกิล
        this.listeners = []; // เก็บข้อมูลการลงทะเบียน Event ของสกิลนี้
    }
    // ลงทะเบียน Listener สำหรับ Event ที่สกิลนี้ต้องการฟัง
    registerListener(eventManager, eventName, callback){
        // ทำเครื่องหมาย Callback ว่าเป็นของ TriggerSkill
        callback._isTriggerSkill = true;
        // ลงทะเบียน Callback เข้ากับ EventManager จริง
        eventManager.on(eventName, callback);
        // เก็บข้อมูล listener ไว้สำหรับการยกเลิกการลงทะเบียนในอนาคต
        this.listeners.push({
            eventManager, 
            eventName, 
            callback, 
            skill: this, 
            owner: this.owner
        });
    }
    // ยกเลิกการลงทะเบียน Event ทั้งหมดของสกิลนี้
    unregister(){
        // ยกเลิก Callback ออกจาก EventManager จริงก่อนล้างรายการ
        for(const listener of this.listeners){
            listener.eventManager.off(
                listener.eventName, 
                listener.callback
            );
        }
        // ล้างรายการ listener
        this.listeners = [];
    }
    // รับคำตอบจาก Generic Trigger Choice
    resolveChoice(player , game, context, useSkill){
        return false;
    }
    // คืนค่าจำนวนการ์ดที่ต้องเลือกสำหรับ Trigger Skill (ค่าเริ่มต้นคือ 1 ใบ)
    triggerCardSelectionCount(player, game){
        return 1;
    }
    // ตรวจสอบว่าสามารถเลือกเป้าหมาย target นี้ได้หรือไม่ (ค่าเริ่มต้นคือ false)
    canTriggerTarget(player, target, game, context){
        return false;
    }
}