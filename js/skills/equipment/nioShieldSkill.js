class NioShieldSkill extends ArmorSkill{

    constructor(){
        super("โล่เหรินหวัง");
    }
    // ฟังก์ชันสำหรับลงทะเบียน Event Listener ของโล่เหรินหวัง
    register(eventManager, player){
        const callback = (context) => {
            // ตรวจสอบว่าเป้าหมายการโจมตีคือเจ้าของโล่หรือไม่
            if(context.target !== player){
                return;
            }
            // ตรวจสอบว่าเป็น SlashCard หรือไม่
            if(!(context.card instanceof SlashCard)){
                return;
            }
            // ตรวจสอบว่าเป็นการ์ดสีดำ
            if(context.card.suit !== "♠️" && context.card.suit !== "♣️"){
                return;
            }
            player.game.log(player.name + " ใช้โล่เหรินหวัง ป้องกัน " + context.card.getName());
            context.dodge = true;
        };
        this.registerListener(eventManager, "beforeDodge", callback);
    }
}