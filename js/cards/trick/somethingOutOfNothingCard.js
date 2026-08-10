class SomethingOutOfNothingCard extends TrickCard{
    constructor(suit, number){
        // กำหนดชื่อการ์ดอุบาย "บังเกิดมีสิ่ง" พร้อมดอก (suit) และตัวเลข (number)
        super("บังเกิดมีสิ่ง", suit, number);
    }
    //
    use(player, game){
        game.log(player.name + " จั่วการ์ด 2 ใบ");
        // จั่วการ์ดจากกองกลางเข้ามือ 2 ใบ
        player.drawCard(game.deck);
        player.drawCard(game.deck);
        return true;
    }
}
