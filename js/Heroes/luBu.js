class LuBu extends Player{

    constructor(game, controllerClass){
        super("ลิโป้", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Qun";
        this.gender = "male";

        this.abilityDescription = 
            "Unrivaled (ไร้เทียมทาน)\n" + 
            "ตัวละครอื่นจะต้องลงการ์ด หลบ จำนวน 2 ใบ เพื่อป้องกันการ์ด โจมตี ของคุณ\n" + 
            "และตัวละครใดก็ตามที่ใช้ ดวลเดี่ยว กับคุณ จะต้องลงการ์ด โจมตี ครั้งละ 2 ใบในแต่ละรอบที่ถูกร้องขอ"

        this.addSkill(new Unrivaled());

        this.hand.addCard(new DuelCard("♠️", 1));
    }
}