class Cultivation extends PassiveSkill{

    constructor(){
        super("Cultivation");
    }
    // Called when the player uses a trick or delayed trick card
    onCardUsed(player, card, game){

        if(player !== this.owner){
            return false;
        }
        if(
            !(card instanceof TrickCard) && 
            !(card instanceof DelayedTrickCard)
        ){
            return false;
        }
        player.drawCard(game.deck);
        game.log(
            player.name + " ใช้ Cultivation จั่วการ์ด 1 ใบ"
        );
        return true;
    }
}