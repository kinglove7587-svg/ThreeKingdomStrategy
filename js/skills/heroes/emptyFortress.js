class EmptyFortress extends TriggerSkill{

    constructor(){
        super("Empty Fortress");
    }
    //
    register(eventManager, player){

        const callback = (context) => {
            if(context.primaryTarget !== player){
                return;
            }
            if(!(context.card instanceof SlashCard)){
                return;
            }
            if(player.hand.cards.length > 0){
                return;
            }
            context.canceled = true;
        };

        this.registerListener(
            eventManager, 
            "beforeSlashTarget", 
            callback
        );
    }
}