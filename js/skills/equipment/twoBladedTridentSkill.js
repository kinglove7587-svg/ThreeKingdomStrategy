class TwoBladedTridentSkill extends TriggerSkill{
    constructor(){
        super("ง้าวสามคม");
    }
    // ผูก Event Listener 'afterDamage' เมื่อผู้เล่นสวมใส่อาวุธนี้
    register(eventManager, player){
        this.registerListener(
            eventManager, 
            "afterDamage", 
            this.onAfterDamage.bind(this, player)
        );
    }
    // ตรวจสอบเงื่อนไขหลังสร้างความเสียหายด้วย SlashCard
    onAfterDamage(player, damage){
        if(!(damage.card instanceof SlashCard)){
            return;
        }
        
        if(damage.source !== player){
            return;
        }
        
        if(!damage.target){
            return;
        }
        
        if(player.controller instanceof HumanController){
            player.controller.startTriggerChoice(this, 
                {
                    damage: damage, 
                    target: damage.target
                }
            );
        }
    }
    // ประมวลผลคำตอบเมื่อผู้เล่นเลือก "ใช้ / ไม่ใช้" สกิล
    resolveChoice(player, game, context, useSkill){
        if(!useSkill){
            game.log(player.name + " ไม่ใช้ ง้าวสามคม");
            return false;
        }
        
        player.controller.startTriggerCardSelection(this, context);

        return true;
    }
    // ตรวจสอบว่าเป้าหมายที่สองตรงตามเงื่อนไขหรือไม่ (ระยะห่างทางกายภาพ <= 1 จากเป้าหมายแรก)
    canTriggerTarget(player, target, game, context){
        if(!target){
            return false;
        }
        
        if(target === player){
            return false;
        }
        
        if(
            context && 
            target === context.target
        ){
            return false;
        }
        
        if(!context || !context.target){
            return false;
        }
        
        return game.getDistance(context.target, target) <= 1;
    }
    // ประมวลผลลัพธ์ ทิ้งการ์ดจากมือ และสร้าง Damage 1 แก่เป้าหมายที่สอง
    resolveTriggerTarget(player, game, context){
        const cardIndex = player.hand.cards.indexOf(context.card);
        
        if(cardIndex === -1){
            return false;
        }
        
        const card = player.hand.removeCard(cardIndex);
        
        if(!card){
            return false;
        }
        
        game.discardPile.addCard(card);
        
        const damage = new Damage(player, context.secondaryTarget, 1);
        damage.card = this;
        
        game.damage(damage);

        game.log(player.name + 
            " ใช้ง้าวสามคม โจมตี " + 
            context.secondaryTarget.name + 
            " เพิ่ม 1 Damage"
        );

        return true;
    }
}