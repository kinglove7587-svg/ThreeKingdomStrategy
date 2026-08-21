class RestAndReorganizationCard extends TrickCard{

    constructor(suit, number){
        super("พักพลจัดทัพ", suit, number);
    }
    // ประมวลผลการใช้การ์ดพักพลจัดทัพ
    use(player, game){
        // ให้ผู้ใช้จั่วการ์ด 2 ใบ
        player.drawCard(game.deck);
        player.drawCard(game.deck);
        game.log(player.name + " จั่วการ์ด 2 ใบ");
        // ล้างรายการการ์ดที่เลือกไว้ก่อนเริ่มเลือกใหม่
        player.controller.selectedRestAndReorganizationCards = [];
        // เข้าสู่สถานะรอเลือกการ์ดทิ้ง
        player.controller.inputState = "waitingRestAndReorganizationDiscard";
        game.ui.render();
        return true;
    }
    getDescription(){
        return "จั่วการ์ด 2 ใบ แล้วเลือกการ์ดจากมือ 2 ใบเพื่อทิ้ง";
    }
}