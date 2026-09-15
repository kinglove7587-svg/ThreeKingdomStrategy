class LuXun extends Player{

    constructor(game, controllerClass){
        super("ลกซุน", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Wu";
        this.gender = "male";

        this.abilityDescription = 
            "Modesty (ถ่อมตน)\n" +
            "คุณไม่สามารถตกเป็นเป้าหมายของ [ฉกฉวย] และ [สุราลืมกลับ]\n\n" +

            "Second Wind (ลมหายใจเฮือกที่สอง)\n" +
            "เมื่อคุณเสียการ์ดใบสุดท้ายจากมือ คุณสามารถจั่วการ์ด 1 ใบ";

        //this.addSkill(new Modesty());
        //this.addSkill(new SecondWind());
    }
    getPortrait(){
        return "assets/cards/heroes/LuXun.png";
    }
}