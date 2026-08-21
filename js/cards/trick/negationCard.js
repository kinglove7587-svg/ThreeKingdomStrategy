class NegationCard extends TrickCard{
    // สืบทอดจาก TrickCard ใช้สำหรับหักล้าง Effect ของการ์ดคาถา/อุบายอื่น
    constructor(suit, number){
        super("หักล้าง", suit, number);
    }
    // ตรวจสอบว่าการ์ดหักล้างใบนี้สามารถใช้ตอบโต้การ์ดใน Context ได้หรือไม่
    canReact(context){
        // ปิดความสามารถจริงของหักล้างไว้ชั่วคราว
        return false;
        /*
        if(!context){
            return false;
        }

        if(!context.card){
            return false;
        }
        // อนุญาตให้ตอบโต้ถ้าเป็นการ์ดประเภท Trick หรือการ์ดหักล้าง
        return context. card instanceof TrickCard && 
            !(context.card instanceof NegationCard);
        */
        
    }
}