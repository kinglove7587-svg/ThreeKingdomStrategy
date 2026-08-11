class ZhangFei extends Player{ // เตียวหุย
    // ตัวสร้างออบเจกต์เตียวหุย (รับข้อมูลชื่อ, ตัวเกมหลัก, และคลาส Controller)
    constructor(name, game, controllerClass){
        // ส่งพารามิเตอร์ทั้งหมดไปยังคลาสแม่ (Player) เพื่อตั้งค่าพื้นฐาน
        super(name, game, controllerClass);
        // กำหนดพลังชีวิตสูงสุดและพลังชีวิตปัจจุบันเป็น 4 หน่วย
        this.maxHp = 4;
        this.hp = 4;
        // เรียกใช้ addSkill() เพื่อเพิ่มและลงทะเบียน Event สกิลพิโรธคำราม (Paoxiao) อัตโนมัติ
        this.addSkill(new Paoxiao());
        //this.equipArmor(new TengJiaArmor("♣️", 7));
        //this.setChained(true);
        //this.hand.addCard(new IronChainCard("♥️", 1));
        //this.hand.addCard(new PeachCard("♠️", 1));
        //this.hand.addCard(new TrainingSword("♠️", 1));
    }
}