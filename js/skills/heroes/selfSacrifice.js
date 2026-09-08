class SelfSacrifice extends ActiveSkill{

    constructor(){
        super("Self Sacrifice");
    }
    canUse(player, game){
        return (
            player.hp > 0 && 
            player.hand.cards.length < 5
        );
    }
    needsTarget(player, game){
        return false;
    }
    needsCardSelection(player, game){
        return false;
    }
    use(player, game){

        if(!this.canUse(player, game)){
            return false;
        }
        player.loseHp(1);
        for(let i = 0; i < 2; i++){
            player.drawCard(game.deck);
        }
        game.log(player.name + " ใช้ Self Sacrifice");
        return true;
    }
    getDescription(){
        return "Self Sacrifice (เสียสละ)\n" +
            "ใน Play Phase คุณสามารถเลือกที่จะเสียพลังชีวิต 1 หน่วย " +
            "เพื่อจั่วการ์ด 2 ใบ และ การ์ดในมือต้องมีน้อยกว่า 5 ใบถึงจะใช้ได้";
    }
}