class Composure extends PassiveSkill{

    constructor(){
        super("Composure");
    }
    // เพิ่ม Hand Limit หากยังไม่ได้ใช้การ์ด โจมตี ในเทิร์นนี้
    getHandLimitModifier(player, game){

        if(player.slashUsed){
            return 0;
        }
        return 1;
    }
}