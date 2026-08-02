class WeaponCard extends EquipmentCard{
    // กำหนดประเภทอาวุธ พร้อมระยะการโจมตี (range)
    constructor(name, suit, number, range){
        // ส่งชื่อ (name), ดอก/สี (suit) และตัวเลขหน้าไพ่ (number) ไปยัง EquipmentCard
        super(name, suit, number);
        // บันทึกระยะการโจมตีของการ์ดอาวุธใบนี้
        this.range = range;
    }
    // ใช้งานการ์ดอาวุธ
    use(player, game){
        // สวมใส่อาวุธให้ผู้เล่น
        player.equipWeapon(this);
        // บันทึกข้อความลงใน Log ของเกม
        game.log(player.name + " สวม " + this.name);
        // คืนค่า true เพื่อแสดงว่าใช้งานการ์ดสำเร็จ
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
