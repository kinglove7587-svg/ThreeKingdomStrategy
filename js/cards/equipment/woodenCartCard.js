class WoodenCartCard extends EquipmentCard{

    constructor(suit, number){
        super("รถไม้", suit, number);
    }
    //
    use(player, game){
        return player.controller.startWoodenCartSelection();
    }
    getDescription(){
        return "เลือกการ์ด 1 ใบจากมือและมอบให้ผู้เล่นอื่น";
    }
}