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
            "เมื่อคุณใช้การ์ดใบสุดท้ายจากมือใน Play Phase ของคุณ คุณต้องจั่วการ์ด 1 ใบทันที";

        this.addSkill(new Modesty());
        this.addSkill(new SecondWind());
        
        //this.equipWeapon(new SkyPiercingHalberdCard("♣️", 7));
        //this.equipArmor(new SilverLionHelmetCard("♣️", 7));
        //this.equipMount(new ShadowrunnerCard("♣️", 7));
    }
    getPortrait(){
        return "assets/cards/heroes/LuXun.png";
    }
}