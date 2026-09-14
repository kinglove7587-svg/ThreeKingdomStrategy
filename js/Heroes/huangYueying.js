class HuangYueying extends Player{

    constructor(game, controllerClass){
        super("อุยซี", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Shu";
        this.gender = "female";

        this.abilityDescription = 
            "Cultivation (บำเพ็ญเพียร)\n" +
            "คุณสามารถจั่วการ์ด 1 ใบ หลังจากใช้การ์ดกลอุบาย\n\n" +

            "Wizardry (เวทมนตร์กลศาสตร์)\n" +
            "การ์ดกลอุบายของคุณไม่จำกัดระยะ";

        //this.addSkill(new Cultivation());
        //this.addSkill(new Wizardry());
    }
    getPortrait(){
        return "assets/cards/heroes/HuangYueying.png";
    }
}