class Unrivaled extends TriggerSkill{

    constructor(){
        super("Unrivaled");
    }
    register(eventManager, player){

        const callback = (context)=>{
            if(context.attacker !== player){
                return;
            }
            context.requiredDodgeCount = 2;
            player.game.log(player.name + " ใช้สกิล Unrivaled");
        };

        this.registerListener(
            eventManager, 
            "beforeDodge", 
            callback
        );
    }
}