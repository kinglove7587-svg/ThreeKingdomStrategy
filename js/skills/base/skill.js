class Skill{
    // กำหนดโครงสร้างเริ่มต้นของ Skill โดยรับชื่อสกิลเข้ามาเก็บไว้
    constructor(name){
        this.name = name;
    }
    // เช็กว่าผู้เล่นสามารถกดใช้/ส่งผลสกิลนี้ได้หรือไม่ (คืนค่า true/false)
    canUse(player, game){
        return false;
    }
    // สั่งให้สกิลทำงานเมื่อผู้เล่นเลือกใช้งานสกิล
    use(player, game){
        return false;
    }
    // Skill Events (จุดเชื่อมต่อกับแต่ละ Phase ของเกม)
    // ทำงานเมื่อ "เริ่มเทิร์น" ของผู้เล่น
    onTurnStart(player, game){}
    // ทำงานเมื่อเข้าสู่ "ช่วงเช็กดวง/คำนวนผล (Judge Phase)"
    onJudgePhase(player, game){}
    // ทำงานเมื่อเข้าสู่ "ช่วงจั่วไพ่ (Draw Phase)"
    onDrawPhase(player, game){}
    // ทำงานเมื่อเข้าสู่ "ช่วงใช้ไพ่ (Play Phase)"
    onPlayPhase(player, game){}
    // ทำงานเมื่อเข้าสู่ "ช่วงทิ้งไพ่ (Discard Phase)"
    onDiscardPhase(player, game){}
    // ทำงานเมื่อ "จบเทิร์น" ของผู้เล่น
    onTurnEnd(player, game){}
    // ลงทะเบียน Event ของสกิล
    // TriggerSkill จะ Override เมธอดนี้
    register(eventManager, player){}
    // สำหรับยกเลิก Event ของ Skill
    unregister(){}

    getDescription(){
        return "";
    }
}