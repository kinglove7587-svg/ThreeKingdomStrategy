class HuaTuo extends Player{

    constructor(game, controllerClass){
        super("ฮัวโต๋", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Qun";
        this.gender = "male";
        this.abilityDescription = 
            "First Aid (หัตถ์โอสถช่วยชีวิต)\n" +
            "ในช่วง Play Phase สามารถใช้การ์ดสีแดง 1 ใบ แทน [ยา] ได้\n\n" +
            "Prodigal Healer (หมอเทพเมตตา)\n" +
            "จำกัด 1 ครั้งต่อ Play Phase ทิ้งการ์ด 1 ใบ เพื่อให้ตัวละครที่บาดเจ็บฟื้น HP 1";
        this.addSkill(new FirstAid());
        this.addSkill(new ProdigalHealer());
    }
}