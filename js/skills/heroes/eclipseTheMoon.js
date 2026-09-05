class EclipseTheMoon extends TriggerSkill{

    constructor(){
        super("Eclipse The Moon");
    }
    onTurnEnd(player, game){

        if(player !== this.owner){
            return;
        }
        game.log(
            player.name + " จั่วการ์ดจาก Eclipse The Moon 1 ใบ"
        );
        player.drawCard(game.deck);
    }
}