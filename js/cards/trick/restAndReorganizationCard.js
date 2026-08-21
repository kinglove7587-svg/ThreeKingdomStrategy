class RestAndReorganizationCard extends TrickCard{

    constructor(suit, number){
        super("พักพลจัดทัพ", suit, number);
    }
    //
    use(player, game){
        //
    }
    getDescription(){
        return "จั่วการ์ด 2 ใบ แล้วเลือกการ์ดจากมือ 2 ใบเพื่อทิ้ง";
    }
}