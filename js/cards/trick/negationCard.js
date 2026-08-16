class NegationCard extends TrickCard{
    // สืบทอดจาก TrickCard ใช้สำหรับหักล้าง Effect ของการ์ดคาถา/อุบายอื่น
    constructor(suit, number){
        super("หักล้าง", suit, number);
    }
}