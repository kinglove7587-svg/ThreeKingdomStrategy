class LiuBei extends Player{ // เล่าปี่
    // ตัวสร้างออบเจกต์เล่าปี่ (รับข้อมูลชื่อ, ตัวเกมหลัก, และคลาส Controller)
    constructor(name, game, controllerClass){
        // ส่งพารามิเตอร์ทั้งหมดไปยังคลาสแม่ (Player) เพื่อตั้งค่าพื้นฐาน
        super(name, game, controllerClass);
        // กำหนดพลังชีวิตสูงสุดและพลังชีวิตปัจจุบันเป็น 4 หน่วย
        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Shu";
        this.gender = "male";
        this.abilityDescription = {
            rende:
                "ช่วง Play Phase สามารถมอบการ์ดจากมือให้ตัวละครอื่นได้จำนวนเท่าใดก็ได้\n" +
                "และเมื่อมอบการ์ดตั้งแต่ 2 ใบขึ้นไป จะฟื้น HP 1",

            influencing:
                "สามารถขอให้ตัวละครฝ่าย Shu ใช้หรือเล่น [โจมตี] แทนตนได้ หากตัวละครนั้นเต็มใจ"
        };
        this.addSkill(new Rende());
        //this.setChained(true);
        //this.equipWeapon(new SerpentSpearCard("♣️", 7));
        //this.equipArmor(new SilverLionHelmetCard("♣️", 7));
        //this.hand.addCard(new WoodenCartCard("♠️", 1));
        //this.hand.addCard(new WoodenCartCard("♠️", 1));
        //this.hand.addCard(new SlashCard("♠️", 1));
    }
}