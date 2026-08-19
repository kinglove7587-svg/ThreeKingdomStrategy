class LiuBei extends Player{ // เล่าปี่
    // ตัวสร้างออบเจกต์เล่าปี่ (รับข้อมูลชื่อ, ตัวเกมหลัก, และคลาส Controller)
    constructor(name, game, controllerClass){
        // ส่งพารามิเตอร์ทั้งหมดไปยังคลาสแม่ (Player) เพื่อตั้งค่าพื้นฐาน
        super(name, game, controllerClass);
        // กำหนดพลังชีวิตสูงสุดและพลังชีวิตปัจจุบันเป็น 4 หน่วย
        this.maxHp = 4;
        this.hp = 4;
        // เรียกใช้ addSkill() เพื่อเพิ่มสกิลและลงทะเบียน Event สกิลจิตเมตตา (Rende) อัตโนมัติ
        this.addSkill(new Rende());
        //this.setChained(true);
        //this.equipWeapon(new SerpentSpearCard("♣️", 7));
        //this.equipArmor(new SilverLionHelmetCard("♣️", 7));
        this.hand.addCard(new WineCard("♠️", 1));
        //this.hand.addCard(new StealCard("♠️", 1));
        this.hand.addCard(new SlashCard("♠️", 1));
    }
}