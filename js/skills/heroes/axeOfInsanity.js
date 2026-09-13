class AxeOfInsanity extends TriggerSkill{

    constructor(){
        super("Axe Of Insanity");
    }
    //
    register(eventManager, player){

        const callback = (damage, resolution) => {
            if(!damage){
                return;
            }
            console.log(
                "Axe Of Insanity ตรวจ afterDamage:", 
                damage.source?.name, "→", 
                damage.target?.name, "damage =", 
                damage.amount
            );
        };

        this.registerListener(
            eventManager, 
            "afterDamage", 
            callback
        );
    }
}