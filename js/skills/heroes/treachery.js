class Treachery extends TriggerSkill{

    constructor(){
        super("Treachery");
    }
    // รับฟังเหตุการณ์หลังจากได้รับความเสียหาย
    register(eventManager, player){

        const callback = (damage) => {
            if(damage.target !== player){
                return;
            }
            if(!damage.card){
                return;
            }
            if(!player.isAlive()){
                return;
            }
            if(damage.amount <= 0){
                return;
            }

            const card = damage.card;
            card.TreacheryClaimd = true;
            player.hand.addCard(card);
            player.game.log(player.name + " ได้รับ " + card.name + " จากสกิล Treachery");
        };
        this.registerListener(eventManager, "afterDamage", callback);
    }
}