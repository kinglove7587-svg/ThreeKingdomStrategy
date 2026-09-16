class LadyGan extends Player{

    constructor(game, controllerClass){
        super("กำฮูหยิน", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Shu";
        this.gender = "female";

        this.abilityDescription = 
            "Divine Wisdom (ปัญญาเทวะ)\n" +
            "เมื่อเริ่มต้นเทิร์นของคุณ คุณสามารถทิ้งการ์ดบนมือทั้งหมดของคุณ " +
            "หากจำนวนการ์ดที่ทิ้งมากกว่า HP ของคุณ คุณฟื้นฟู HP 1 หน่วย\n\n" +

            "Prudence (สุขุมรอบคอบ)\n" +
            "เมื่อคุณฟื้นฟู HP 1 หน่วย คุณสามารถเลือกตัวละครอื่น 1 คน " +
            "ให้เขาจั่วการ์ด 1 ใบ หรือจั่ว 2 ใบ หากในขณะนั้นตัวละครนั้นไม่มีการ์ดในมือ";

        //this.addSkill(new DivineWisdom());
        //this.addSkill(new Prudence());
    }
    getPortrait(){
        return "assets/cards/heroes/LadyGan.png";
    }
}