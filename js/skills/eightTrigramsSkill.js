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
            // เรียกใช้ระบบ Judge กลางของเกม เพื่อเช็กว่าไพ่ที่เปิดได้เป็นดอกสีแดง (♥ ♦) หรือไม่
            const success = player.game.judge(card => {
                return (card.suit === "♥️" || card.suit === "♦️");
            });
            // หากผล Judge เป็นจริง (เปิดได้สีแดง) ให้กำหนดสถานะหลบสำเร็จ
            if (success){
                context.dodge = true;
            }
        };
        // ใช้ registerListener ของ TriggerSkill เพื่อลงทะเบียน Event "beforeDodge"
        this.registerListener(eventManager, "beforeDodge", callback);
    }
}