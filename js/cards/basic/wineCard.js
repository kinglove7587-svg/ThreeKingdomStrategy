class WineCard extends BasicCard{
    constructor(suit, number){
        super("Basic", "สุรา", suit, number);
    }
    //
    use(player, game){
        // ถ้าอยู่ในสถานะใกล้ตาย ใช้สุราเพื่อฟื้น HP
        if(player.isDying()){
            game.log(player.name + " ใช้ สุรา ฟื้นฟู");
            player.recoverHp(1);
            return true;
        }
        // ถ้าไม่ได้ใกล้ตาย ให้เข้าสถานะเมาสุรา (เพิ่มความเสียหายให้ไพ่ฆ่าใบถัดไป)
        player.setDrunk(true);
        game.log(player.name + " ดื่มสุรา");
        return true;
    }
}