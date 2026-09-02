class CaoCao extends Player{

    constructor(game, controllerClass){
        super("โจโฉ", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Wei";
        this.gender = "male";

        this.abilityDescription = 
            "Treachery (เจ้าเล่ห์)\n" +
            "เมื่อคุณได้รับความเสียหายจากการ์ด ให้รับการ์ดต้นเหตุนั้นเข้ามือ\n\n" +
            "Entourage (เมื่อคุณรับบทเป็นเจ้าเมือง)\n" +
            "สามารถขอให้ตัวละครฝ่าย Wei ใช้ [หลบ] แทนตนได้ หากตัวละครนั้นเต็มใจ";
        
        this.addSkill(new Treachery());

        //this.hand.addCard(new PeachCard("♠️", 1));
    }
    getPortrait(){
        return "assets/cards/heroes/caoCao.png";
    }
}