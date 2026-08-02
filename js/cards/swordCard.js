class SwordCard extends WeaponCard{
    // กำหนดชื่อการ์ดเป็น "ดาบ" พร้อมดอก/สี, ตัวเลขหน้าไพ่ และกำหนดระยะการโจมตี (range) เท่ากับ 2
    constructor(suit, number){
        super("ดาบ", suit, number, 2);
    }
    // ใช้งานการ์ดดาบ
    use(player, game){
        // สวมใส่อาวุธดาบใบนี้ให้กับผู้เล่น
        player.equipWeapon(this);
        console.log(player.name + " สวม " + this.name);
        return true;
    }
}