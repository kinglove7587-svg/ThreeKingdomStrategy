class Stauchness extends TriggerSkill{

    constructor(){
        super("Stauchness");
    }
    register(eventManager, player){

        const callback = (damage) => {
            if(!damage){
                return;
            }
            if(damage.target !== player){
                return;
            }
            if(damage.amount <= 0){
                return;
            }
            player.controller.startTriggerChoice(
                this, 
                {
                    damage: damage
                }
            );
        };
        this.registerListener(
            eventManager, 
            "afterDamage", 
            callback
        );
    }
}