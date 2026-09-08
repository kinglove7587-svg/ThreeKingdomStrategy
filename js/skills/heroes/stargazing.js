class Stargazing extends TriggerSkill{

    constructor(){
        super("Stargazing");
    }
    onJudgePhase(player, game){

        if(player !== this.owner){
            return;
        }
        if(player.controller instanceof HumanController){
            //เปลี่ยนสถานะเพื่อหยุด Flow ก่อนเข้าสู่ Draw Phase
            player.controller.inputState = "waitingStargazingChoice";
            game.ui.render();
        }
    }
    getDescription(){
        return "Stargazing (มองฟ้า)\n" +
            "ก่อนเริ่มเทิร์น คุณสามารถดูการ์ด X ใบบนสุดของกองจั่ว " +
            "(X = จำนวนตัวละครในเกม สูงสุด 5 ใบ) " +
            "จากนั้นจัดการ์ดเหล่านั้นเรียงลำดับใดก็ได้ไว้ด้านบนสุดของกองจั่ว " +
            "และนำการ์ดที่เหลือไปไว้ด้านล่างสุดของกองจั่ว";
    }
}