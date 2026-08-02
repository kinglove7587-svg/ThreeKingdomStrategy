class Paoxiao extends TriggerSkill{
    // สร้างสกิล Paoxiao (พิโรธคำราม)
    constructor(){
        super("Paoxiao");
    }
    // ลงทะเบียน Event เข้ากับ EventManager
    register(eventManager, player){
        // ลงทะเบียนรับฟัง Event "beforeUseSlash" ก่อนที่ผู้เล่นจะใช้การ์ดฆ่า
        eventManager.on("beforeUseSlash", (context)=>{
            // ตรวจสอบว่าผู้เล่นที่กำลังจะใช้การ์ดฆ่า ใช่เจ้าของสกิลนี้หรือไม่
            if (context.player !== player){
                return;
            }
            // อนุญาตให้ใช้การ์ดฆ่าได้เสมอ (ยกเลิกข้อจำกัด 1 ครั้งต่อเทิร์น)
            context.allow = true;
            console.log(player.name + " ใช้สกิล Paoxiao");
        });
    }
}