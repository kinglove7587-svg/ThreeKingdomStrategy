class Paoxiao extends TriggerSkill{
    // สร้างสกิล Paoxiao (พิโรธคำราม)
    constructor(){
        super("Paoxiao");
    }
    // ลงทะเบียน Event เข้ากับ EventManager
    register(eventManager, player){
        // สร้าง Callback Function สำหรับดักจับ Event beforeUseSlash
        const callback = (context)=>{
            // ตรวจสอบว่าผู้เล่นที่กำลังจะใช้การ์ดฆ่า ใช่เจ้าของสกิลนี้หรือไม่
            if (context.player !== player){
                return;
            }
            // อนุญาตให้ใช้การ์ดฆ่าได้เสมอ (ยกเลิกข้อจำกัด 1 ครั้งต่อเทิร์น)
            context.allow = true;
            player.game.log(player.name + " ใช้สกิล พิโรธคำราม");
        };
        // ใช้ registerListener ของ TriggerSkill เพื่อลงทะเบียน Event และบันทึก Callback ไว้สำหรับการ unregister ในอนาคต
        this.registerListener(eventManager, "beforeUseSlash", callback);
    }
}