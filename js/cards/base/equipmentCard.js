class EquipmentCard extends Card{
    // กำหนดประเภทของการ์ดสืบทอดเป็น "Equipment" พร้อมชื่อ, ดอก และตัวเลขหน้าไพ่
    constructor(name, suit, number){
        super("Equipment", name, suit, number);
        this.skills = [] // เก็บสกิลของการ์ดอุปกรณ์
    }
    // การ์ดอุปกรณ์เมื่อใช้แล้ว จะไม่ถูกส่งลงกองทิ้ง
    shouldDiscard(){
        return false;
    }
    // เพิ่มสกิลให้กับผู้เล่นที่สวมใส่อุปกรณ์นี้
    addSkill(skill){
        // เพิ่มอินสแตนซ์ของสกิลเข้าไปเก็บไว้ในอาร์เรย์ this.skills ของการ์ดอุปกรณ์
        this.skills.push(skill);
    }
}