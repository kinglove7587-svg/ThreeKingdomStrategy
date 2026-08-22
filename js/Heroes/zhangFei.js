class ZhangFei extends Player{ // เตียวหุย
    // ตัวสร้างออบเจกต์เตียวหุย (รับข้อมูลชื่อ, ตัวเกมหลัก, และคลาส Controller)
    constructor(name, game, controllerClass){
        // ส่งพารามิเตอร์ทั้งหมดไปยังคลาสแม่ (Player) เพื่อตั้งค่าพื้นฐาน
        super(name, game, controllerClass);
        // กำหนดพลังชีวิตสูงสุดและพลังชีวิตปัจจุบันเป็น 4 หน่วย
        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Shu";
        this.gender = "male";
        this.addSkill(new Paoxiao());
        this.abilityDescription =  "Paoxiao (พิโรธคำราม)\n" + 
        "คุณสามารถใช้การ์ด [โจมตี] ได้กี่ใบก็ได้ใน 1 เทิร์น"
        //this.equipWeapon(new CrossbowCard("♣️", 7));
        //this.equipArmor(new SilverLionHelmetCard("♣️", 7));
        //this.setChained(true);
        //this.hand.addCard(new NioShieldCard("♥️", 1));
        //this.hand.addCard(new BumperHarvestCard("♠️", 1));
        //this.hand.addCard(new SlashCard("♠️", 1));
    }
}