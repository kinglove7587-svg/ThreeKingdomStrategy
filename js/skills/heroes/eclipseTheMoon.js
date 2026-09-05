class EclipseTheMoon extends TriggerSkill{

    constructor(){
        super("Eclipse The Moon");
    }
    register(eventManager, player){

        const callback = (turnEndPlayer) => {
            // ต้องเป็นเจ้าของสกิลที่กำลังจบเทิร์น
            if(turnEndPlayer !== player){
                return;
            }
            player.game.log(player.name + " จั่วการ์ดจาก Eclipse the Moon 1 ใบ");
            player.drawCard(player.game.deck);
        };
        this.registerListener(
            eventManager, 
            "onTurnEnd", 
            callback
        );
    }
}