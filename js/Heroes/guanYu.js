class GuanYu extends Player{

    constructor(game, controllerClass){
        super("กวนอู", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Shu";
        this.gender = "male";

        this.abilityDescription = 
            "God Of War (เทพสงคราม)\n" + 
            "คุณสามารถใช้หรือเล่นการ์ดใบใดก็ได้ที่มี ♥️ แทนการ์ด [โจมตี] ได้"

        //this.addSkill(new );
    }
}