class ZhangFei extends Player{ // เตียวหุย
    // ตัวสร้างออบเจกต์เตียวหุย (รับข้อมูลชื่อ, ตัวเกมหลัก, และคลาส Controller)
    constructor(name, game, controllerClass){
        // ส่งพารามิเตอร์ทั้งหมดไปยังคลาสแม่ (Player) เพื่อตั้งค่าพื้นฐาน
        super(name, game, controllerClass);
        // กำหนดพลังชีวิตสูงสุดและพลังชีวิตปัจจุบันเป็น 4 หน่วย
        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Shu";
        this.gender = "female";
        this.addSkill(new Paoxiao());
        //this.equipWeapon(new CrossbowCard("♣️", 7));
        //this.equipArmor(new SilverLionHelmetCard("♣️", 7));
        //this.setChained(true);
        //this.hand.addCard(new NioShieldCard("♥️", 1));
        //this.hand.addCard(new DodgeCard("♠️", 1));
        //this.hand.addCard(new SlashCard("♠️", 1));
    }
}