class RockCleavingAxeSkill extends TriggerSkill{
    constructor(){
        super("ขวานผ่าศิลา");
    }

    register(eventManager, player){
        this.registerListener(
            eventManager,
            "beforeSlashHit",
            this.onBeforeSlashHit.bind(this, player)
        );
    }

    onBeforeSlashHit(player, context){
        if(!context.canceled){
            return;
        }

        if(player.hand.cards.length < 2){
            return;
        }

        if(player.controller instanceof HumanController){
            context.waitingTrigger = true;

            player.controller.startTriggerChoice(
                this,
                {
                    slashContext: context
                }
            );
        }
    }

    resolveChoice(player, game, context, useSkill){
        const slashContext = context.slashContext;

        if(!useSkill){
            slashContext.waitingTrigger = false;
            game.log(player.name + " ไม่ใช้ ขวานผ่าศิลา");
            return slashContext.resume();
        }

        player.controller.startTriggerCardSelection(
            this,
            context
        );

        return true;
    }

    triggerCardSelectionCount(player, game){
        return 2;
    }

    resolveTriggerCards(player, game, context){
        if(!context.cards || context.cards.length !== 2){
            return false;
        }

        const indices = context.cards.map(
            card => player.hand.cards.indexOf(card)
        );

        if(indices.includes(-1)){
            return false;
        }

        const sortedIndices = [...indices].sort((a, b) => b - a);

        for(const index of sortedIndices){
            const card = player.hand.removeCard(index);

            if(!card){
                return false;
            }

            game.discardPile.addCard(card);
        }

        context.slashContext.canceled = false;
        context.slashContext.waitingTrigger = false;

        game.log(
            player.name +
            " ใช้ ขวานผ่าศิลา บังคับให้โจมตีโดน " +
            context.slashContext.target.name
        );

        return context.slashContext.resume();
    }
}
