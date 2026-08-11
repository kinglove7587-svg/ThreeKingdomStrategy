class PeachGardenCard extends TrickCard{
    constructor(suit, number){
        super("คำสาบานสวนท้อ", suit, number);
    }
    // สั่งใช้งานการ์ดคำสาบานสวนท้อ โดยฟื้นฟูพลังชีวิต (HP)
    use(player, game){
        // วนลูปผู้เล่นทุกคนในเกม (รวมถึงตัวเอง) เพื่อฟื้นฟู HP คนละ 1 หน่วย
        for(const target of game.players){
            target.recoverHp(1);
        }
        return true;
    }
}