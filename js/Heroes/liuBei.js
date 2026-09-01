class LiuBei extends Player{ // เล่าปี่
    // ตัวสร้างออบเจกต์เล่าปี่ (รับข้อมูลชื่อ, ตัวเกมหลัก, และคลาส Controller)
    constructor(game, controllerClass){
        // ส่งพารามิเตอร์ทั้งหมดไปยังคลาสแม่ (Player) เพื่อตั้งค่าพื้นฐาน
        super("เล่าปี่", game, controllerClass);
        // กำหนดพลังชีวิตสูงสุดและพลังชีวิตปัจจุบันเป็น 4 หน่วย
        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Shu";
        this.gender = "female";
        this.abilityDescription =
            "Rende (จิตเมตตา)\n" +
            "ช่วง Play Phase สามารถมอบการ์ดจากมือให้ตัวละครอื่นได้จำนวนเท่าใดก็ได้\n" +
            "และเมื่อมอบการ์ดตั้งแต่ 2 ใบขึ้นไป จะฟื้น HP 1\n\n" +
            "Influencing (เมื่อคุณรับบทเป็นเจ้าเมือง)\n" +
            "สามารถขอให้ตัวละครฝ่าย Shu ใช้หรือเล่น [โจมตี] แทนตนได้ หากตัวละครนั้นเต็มใจ";
        this.addSkill(new Rende());
        //this.setChained(true);
        this.equipWeapon(new FrostSwordCard("♣️", 7));
        //this.equipArmor(new EightTrigramsArmor("♣️", 7));
        //this.hand.addCard(new BarbarianCard("♠️", 1));
        //this.hand.addCard(new StealCard("♠️", 1));
        //this.hand.addCard(new FrostSwordCard("♠️", 1));
        //this.hand.addCard(new SlashCard("♠️", 1));
    }
}