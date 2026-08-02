class ArmorCard extends EquipmentCard{
    // ตัวสร้างออบเจกต์การ์ดชุดเกราะ (รับข้อมูลชื่อ, ดอกไพ่, และแต้มไพ่)
    constructor(name, suit, number){
        super(name, suit, number);
    }
    use(player, game){
        // เมธอดสำหรับเรียกใช้งานการ์ดชุดเกราะ
        player.equipArmor(this);
        console.log(player.name + " สวม " + this.name);
        return true;
    }
}