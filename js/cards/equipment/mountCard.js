class MountCard extends EquipmentCard{
    constructor(name, suit, number, distanceModifier){
        super(name, suit, number);
        // ค่าปรับระยะห่าง
        this.distanceModifier = distanceModifier;
    }
    // เมื่อกดใช้การ์ดม้า ให้สวมใส่ลงในตัวผู้เล่น
    use(player, game){
        player.equipMount(this);

        game.log(player.name + " สวม " + this.name);

        return true;
    }
    //
    onEquip(player){
        //
    }
    //
    onUnequip(player){
        //
    }
}