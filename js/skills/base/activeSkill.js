class ActiveSkill extends Skill{
    // กำหนด constructor รับชื่อสกิล name เพื่อนำไปสร้าง Active Skill แต่ละตัว
    constructor(name){
        super(name);
    }
    // เมธอดสำหรับตรวจสอบว่าเงื่อนไขการใช้สกิลผ่านหรือไม่ ให้คลาสลูกนำไป Override คืนค่า true/false เอง
    canUse(player, game){
        return false;
    }
    // ตรวจสอบว่าสกิลต้องเลือกเป้าหมายหรือไม่
    needsTarget(player, game){
        return true;
    }
    // ตรวจสอบว่าสกิลต้องให้ผู้เล่นเลือกการ์ดจากมือหรือไม่
    needsCardSelection(player, game){
        return false;
    }
    // ตรวจสอบว่าสามารถเลือก target คนนี้ได้หรือไม่
    canTarget(player, target){
        return true;
    }
    // ตรวจสอบว่าสามารถเลือกการ์ดใบนี้ให้กับสกิลได้หรือไม่
    canSelectSkillCard(player, card, name){
        return true;
    }
    // เมธอดสำหรับสั่งงานสกิลเมื่อถูกเรียกใช้ ให้คลาสลูกนำไป Override เพื่อใส่ความสามารถจริงเอง
    use(player, game){
        return false;
    }
    // กำหนดจำนวนการ์ดที่ต้องเลือกเพื่อใช้งานสกิลนี้
    cardSelectionCount(player, game){
        return 1;
    }
    // ระบุว่าสกิลต้องรอการยืนยันหลังเลือกการ์ด
    waitForCardSelectionConfirmation(player, game){
        return false;
    }
}