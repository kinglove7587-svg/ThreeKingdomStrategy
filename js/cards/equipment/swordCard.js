class SwordCard extends WeaponCard{
    // กำหนดชื่อการ์ดเป็น "ดาบ" พร้อมดอก/สี, ตัวเลขหน้าไพ่ และกำหนดระยะการโจมตี (range) เท่ากับ 2
    constructor(suit, number){
        super("ดาบ", suit, number, 2);
    }
}