class SecondWind extends PassiveSkill{

    constructor(){
        super("Second Wind");
    }
    // Second Wind ทำงานเมื่อเจ้าของ Skill ใช้การ์ดจนเหลือ 0 ใบในมือ
    onCardUsed(player, card, game){
        // Second Wind ทำงานเฉพาะเจ้าของ Skill
        if(player !== this.owner){
            return false;
        }
        // Second Wind ทำงานเฉพาะ Play Phase ของเจ้าของเอง
        if(game.getCurrentPlayer() !== player){
            return false;
        }
        // ต้องเสียการ์ดใบสุดท้ายจากมือจนเหลือ 0 ใบ
        if(player.hand.cards.length !== 0){
            return false;
        }
        // บังคับจั่วการ์ด 1 ใบ
        player.drawCard(game.deck);
        game.log(
            player.name + " ใช้ Second Wind จั่วการ์ด 1 ใบ"
        );
        return true;
    }
}