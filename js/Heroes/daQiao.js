class DaQiao extends Player{

    constructor(game, controllerClass){
        super("ไต้เกี้ยว", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Wu";
        this.gender = "female";

        this.abilityDescription = 
            "Captivating (อาคมลุ่มหลง)\n" +
            "คุณสามารถใช้การ์ดสีแดง ♦️ ใบหนึ่งเป็น [สุราลืมกลับ]\n\n" +

            "Deflection (เบี่ยงเบน)\n" +
            "เมื่อคุณตกเป็นเป้าหมายของ [โจมตี] " +
            "คุณสามารถทิ้งการ์ด 1 ใบ " +
            "เพื่อเปลี่ยนเป้าหมายของ [โจมตี] นี้ " +
            "ไปยังตัวละครอื่นที่อยู่ในระยะโจมตีของคุณ " +
            "(ยกเว้นตัวละครที่ใช้ [โจมตี] ใบนั้น)";

        this.addSkill(new Captivating());
        //this.addSkill(new Deflection());
    }
    getPortrait(){
        return "assets/cards/heroes/DaQiao.png";
    }
}