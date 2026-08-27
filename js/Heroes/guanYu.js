class GuanYu extends Player{

    constructor(game, controllerClass){
        super("กวนอู", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Shu";
        this.gender = "male";

        this.abilityDescription = 
            "God Of War (เทพสงคราม)\n" + 
            "คุณสามารถใช้การ์ด ♥️ ใบใดก็ได้ แทนการ์ด [โจมตี]"

        //this.addSkill(new );
    }
}