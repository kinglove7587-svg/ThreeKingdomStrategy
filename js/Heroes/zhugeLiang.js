class ZhugeLiang extends Player{

    constructor(game, controllerClass){
        super("จูกัดเหลียง", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Shu";
        this.gender = "male";

        this.abilityDescription = 
            "Stargazing (มองฟ้า)\n" +
            "ก่อนเริ่มเทิร์น คุณสามารถดูการ์ด X ใบบนสุดของกองจั่ว " +
            "(X = จำนวนตัวละครในเกม สูงสุด 5 ใบ) " +
            "จากนั้นจัดการ์ดเหล่านั้นเรียงลำดับใดก็ได้ไว้ด้านบนสุดของกองจั่ว " +
            "และนำการ์ดที่เหลือไปไว้ด้านล่างสุดของกองจั่ว\n\n" +

            "Empty Fortress (กลศึกเมืองร้าง)\n" +
            "คุณไม่สามารถตกเป็นเป้าหมายของ โจมตี " +
            "หากคุณไม่มีการ์ดในมือ";
        
        this.addSkill(new Stargazing());
        //
    }
    getPortrait(){
        return "assets/cards/heroes/ZhugeLiang.png";
    }
}