class Assault extends TriggerSkill{

    constructor(){
        super("Assault");
    }
    //
    onDrawPhase(player, game){

        if(player !== this.owner){
            return;
        }
        game.pauseDrawPhase(player);
    }
}