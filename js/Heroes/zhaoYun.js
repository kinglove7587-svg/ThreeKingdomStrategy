class ZhaoYun extends Player{

    constructor(game, controllerClass){
        super("จูล่ง", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Shu";
        this.gender = "male";

        this.abilityDescription = 
            "Braveheart (ห้าวหาญ)\n" +
            "คุณสามารถใช้หรือเล่น โจมตี เป็น หลบ " + 
            "และ ในกรณีที่คุณไม่มีหลบ สามารถใช้ โจมตี แทน หลบ ได้";

        this.addSkill(new BraveheartSlash());
        this.addSkill(new BraveheartDodge());
    }
    getPortrait(){
        return "assets/cards/heroes/ZhaoYun.png";
    }
}