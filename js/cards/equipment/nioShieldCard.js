class NioShieldCard extends ArmorCard{

    constructor(suit, number){
        super("โล่เหรินหวัง", suit, number);

        this.addSkill(new NioShieldSkill());
    }
    getDescription(){
        return "ป้องกันผลของการ์ดโจมตีสีดำ (♠️ และ ♣️)";
    }
}