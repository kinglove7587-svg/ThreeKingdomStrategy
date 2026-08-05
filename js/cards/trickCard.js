class TrickCard extends Card{
    // คลาสแม่ของการ์ดกลอุบาย (TrickCard) สืบทอดมาจาก Card โดยกำหนดประเภท (type) เป็น "Trick"
    constructor(name, suit, number){
        super("Trick", name, suit, number);
    }
}