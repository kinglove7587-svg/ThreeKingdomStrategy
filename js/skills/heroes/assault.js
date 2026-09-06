class Assault extends TriggerSkill{

    constructor(){
        super("Assault");
    }
    //
    onDrawPhase(player, game){

        if(player !== this.owner){
            return;
        }
        if(player.controller instanceof HumanController){
            game.pauseDrawPhase(player);
            player.controller.startTriggerChoice(
                this, 
                {
                    drawPhase: true
                }
            );
        }
    }
    //
    resolveChoice(player, game, context, useSkill){

        if(!useSkill){
            game.log(player.name + " ไม่ใช้ Assault");
            return game.resumeDrawPhase();
        }
        game.log(player.name + " ใช้ Assault");
        return true;
    }
}