class MaChao extends Player{

    constructor(game, controllerClass){
        super("ม้าเฉียว", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Shu";
        this.gender = "male";

        this.abilityDescription = 
            "Horse Riding (ความชำนาญอาชา)\n" +
            "ระยะห่างระหว่างคุณกับตัวละครอื่นลดลง 1\n\n" +
            "Cavalry (เพลงหอกเหล็กไหล)\n" +
            "เมื่อคุณใช้ [โจมตี] กับเป้าหมาย " +
            "คุณสามารถเข้าสู่ Judge Phase ได้ " +
            "หากการ์ด Judge เป็นไพ่สีแดง " +
            "เป้าหมายจะไม่สามารถใช้ [หลบ] ได้";

        this.addSkill(new HorseRiding());
        this.addSkill(new Cavalry());
    }
    getPortrait(){
        return "assets/cards/heroes/MaChao.png";
    }
}