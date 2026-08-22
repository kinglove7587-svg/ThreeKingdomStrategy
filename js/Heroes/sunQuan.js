class SunQuan extends Player{

    constructor(game, controllerClass){
        super("ซุนกวน", game, controllerClass);

        this.maxHp = 4;
        this.hp = 4;
        this.faction = "Wu";
        this.gender = "male";

        this.abilityDescription = 
            "Equilibrium\n" +
            "จำกัด 1 ครั้งต่อ Play Phase คุณสามารถทิ้งการ์ดจำนวนเท่าใดก็ได้ แล้วจั่วการ์ดจำนวนเท่ากัน\n\n" +
            "Deliverance (เมื่อคุณรับบทเป็นเจ้าเมือง)\n" +
            "เมื่อการ์ด [ยา] ถูกใช้กับคุณโดยตัวละครฝ่าย Wu คุณฟื้นฟู HP เพิ่มอีก 1";
        
        this.addSkill(new Equilibrium());
    }
}