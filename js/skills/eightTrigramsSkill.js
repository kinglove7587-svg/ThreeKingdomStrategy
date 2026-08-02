class EightTrigramsSkill extends TriggerSkill{
    // ตัวสร้างออบเจกต์ EightTrigramsSkill (กำหนดชื่อสกิลแปดทิศ)
    constructor(){
        super("EightTrigrams"); // ตั้งชื่อสกิลเป็น "EightTrigrams"
    }
    // ลงทะเบียน Event เข้ากับ EventManager
    register(eventManager, player){
        // สร้าง Callback Function สำหรับดักจับ Event beforeDodge
        const callback = (context)=>{
            // ทำงานเฉพาะเมื่อผู้เล่นที่เป็นเป้าหมาย (target) คือเจ้าของเกราะแปดทิศนี้
            if (context.target !== player){
                return;
            }
            console.log(player.name + " ใช้เกราะแปดทิศ");
            // กำหนดสถานะให้หลบการโจมตีสำเร็จ
            context.dodge = true;
        };
        // ใช้ registerListener ของ TriggerSkill เพื่อลงทะเบียน Event "beforeDodge"
        this.registerListener(eventManager, "beforeDodge", callback);
    }
}