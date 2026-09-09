class GongsunZan extends Player{

    constructor(game, controllerClass){
        super("กองซุนจ้าน", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Qun";
        this.gender= "male";

        this.abilityDescription = 
            "Militia (กองอาสา)\n" +
            "หาก HP ของคุณมากกว่า 2 หน่วย " +
            "ระยะห่างระหว่างคุณกับตัวละครอื่นลดลง 1 หน่วย\n" +
            "หาก HP ของคุณน้อยกว่าหรือเท่ากับ 2 หน่วย " +
            "ระยะห่างระหว่างตัวละครอื่นกับคุณเพิ่มขึ้น 1 หน่วย";

        this.addSkill(new Militia());
    }
    getPortrait(){
        return "assets/cards/heroes/GongsunZan.png";
    }
}