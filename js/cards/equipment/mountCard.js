class MountCard extends EquipmentCard{
    constructor(name, suit, number, attackDistanceModifier, defenseDistanceModifier){
        super(name, suit, number);
        // ค่าปรับระยะเมื่อเจ้าของเป็นผู้โจมตี
        this.attackDistanceModifier = attackDistanceModifier;
        // ค่าปรับระยะเมื่อเจ้าของเป็นเป้าหมายถูกโจมตี
        this.defenseDistanceModifier = defenseDistanceModifier;
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