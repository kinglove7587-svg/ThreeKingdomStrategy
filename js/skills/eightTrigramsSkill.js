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
            player.game.log(player.name + " ใช้เกราะแปดทิศ");
            // สั่งเสี่ยงทาย (Judge) และรับค่าผลลัพธ์เป็น JudgeResult
            const result = player.game.judge(player);
            // หากเปิดไม่เจอกระดาษไพ่/กองไพ่หมด ให้ยกเลิกการทำงาน
            if (!result){
                return;
            }
            // ตรวจสอบว่าผลการเสี่ยงทายออกมาเป็นไพ่สีแดง (♥️ หรือ ♦️) หรือไม่
            if (result.isRed()){
                // หากเปิดได้สีแดง ให้กำหนดสถานะหลบสำเร็จ และลง Log แจ้งเตือน
                context.dodge = true;
            }
        };
        // ใช้ registerListener ของ TriggerSkill เพื่อลงทะเบียน Event "beforeDodge"
        this.registerListener(eventManager, "beforeDodge", callback);
    }
}