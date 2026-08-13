class TestHero extends Player{
    constructor(name, game, controllerClass){
        super(name, game, controllerClass);
        // กำหนด HP สำหรับตัวละครทดสอบ
        this.maxHp = 4;
        this.hp = 4;
    }
}