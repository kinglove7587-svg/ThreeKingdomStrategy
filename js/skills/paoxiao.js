class Paoxiao extends TriggerSkill{
    // สร้างสกิล Paoxiao (พิโรธคำราม)
    constructor(){
        super("Paoxiao");
    }
    // ลงทะเบียน Event เข้ากับ EventManager
    register(eventManager, player){
        // ดักฟัง Event ช่วง Play Phase เมื่อถึงเฟสเล่นการ์ด
        eventManager.on("onPlayPhase", (target, game)=>{
            // เช็กว่าผู้เล่นที่เข้าสู่ Play Phase ใช่ตัวเรา เจ้าของสกิล หรือไม่ ถ้าไม่ใช่ให้หยุดการทำงาน
            if (target !== player){
                return;
            }
            // รีเซ็ตสถานะการใช้ Slash ให้เป็น false เพื่อให้สั่งใช้ Slash เพิ่มเติมได้ไม่จำกัด
            player.slashUsed = false;
            // พิมพ์ Log แสดงการทำงานของสกิล Paoxiao
            console.log(player.name + " ใช้สกิล Paoxiao");
        });
    }
}