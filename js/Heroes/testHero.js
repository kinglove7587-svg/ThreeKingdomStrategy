class TestHero extends Player{
    constructor(name, game, controllerClass){
        super(name, game, controllerClass);
        // กำหนด HP สำหรับตัวละครทดสอบ
        this.maxHp = 4;
        this.hp = 4;

        //this.equipArmor(new TengJiaArmor("♣️", 7));
        //this.equipWeapon(new CrossbowCard("♣️", 7));
        //this.hand.addCard(new SlashCard("♠️", 1));
    }
}