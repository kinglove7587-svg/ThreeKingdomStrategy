class Jijiang extends TriggerSkill{ // ปลุกใจทหาร
    //
    constructor(){
        super("Jijiang"); 
    }
    //
    use(player, game){
        console.log(player.name + " ใช้สกิล Jijiang ");
        return true;
    }
}