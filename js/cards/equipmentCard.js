class EquipmentCard extends Card{
    // กำหนดประเภทของการ์ดสืบทอดเป็น "Equipment" พร้อมชื่อ, ดอก และตัวเลขหน้าไพ่
    constructor(name, suit, number){
        super("Equipment", name, suit, number);
    }
    // การ์ดอุปกรณ์เมื่อใช้แล้ว จะไม่ถูกส่งลงกองทิ้ง
    shouldDiscard(){
        return false;
    }
}