class ZhugeLiang extends Player{

    constructor(game, controllerClass){
        super("จูกัดเหลียง", game, controllerClass);

        this.maxHp = 3;
        this.hp = 3;
        this.faction = "Shu";
        this.gender = "male";

        this.abilityDescription = 
            "Stargazing (มองฟ้า)\n" +
            "ใน Preparation Phase คุณสามารถดูการ์ด X ใบบนสุดของกองจั่ว " +
            "(X = จำนวนตัวละครในเกม สูงสุด 5 ใบ) " +
            "จากนั้นจัดการ์ดเหล่านั้นเรียงลำดับใดก็ได้ไว้ด้านบนสุดของกองจั่ว " +
            "และนำการ์ดที่เหลือไปไว้ด้านล่างสุดของกองจั่ว\n\n" +

            "Empty Fortress Stratagem (กลศึกเมืองร้าง)\n" +
            "คุณไม่สามารถตกเป็นเป้าหมายของ โจมตี " +
            "หากคุณไม่มีการ์ดในมือ";
        
        //
        //
    }
    getPortrait(){
        return "assets/cards/heroes/ZhugeLiang.png";
    }
}