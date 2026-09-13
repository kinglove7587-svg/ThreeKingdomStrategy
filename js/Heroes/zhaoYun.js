class ZhaoYun extends Player{

    constructor(game, controllerClass){
        super("จูล่ง", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Shu";
        this.gender = "male";

        this.abilityDescription = 
            "Braveheart (ห้าวหาญ)\n" +
            "คุณสามารถใช้หรือเล่น โจมตี เป็น หลบ หรือ หลบ เป็น โจมตี";

        //this.addSkill(new Braveheart());
    }
    getPortrait(){
        return "assets/cards/heroes/ZhaoYun.png";
    }
}