import { Ichimoku } from '../../src/ichimoku';

describe('Ichimoku', () => {
    it('returns flat lines on constant range with short periods', () => {
        const ichi = new Ichimoku(2, 2, 2, 1);
        const h = 100;
        const l = 100;
        const c = 100;
        ichi.nextValue(h, l, c);
        const v = ichi.nextValue(h, l, c);
        expect(v).toBeDefined();
        expect(v!.tenkan).toBe(100);
        expect(v!.kijun).toBe(100);
        expect(v!.senkouA).toBe(100);
        expect(v!.senkouB).toBe(100);
    });

    it('tenkan reflects max/min over conversion period', () => {
        const ichi = new Ichimoku(2, 2, 2, 1);
        ichi.nextValue(8, 6, 7);
        const v = ichi.nextValue(12, 10, 11) as { tenkan: number; kijun: number };
        // max(8,12)=12, min(6,10)=6 -> (12+6)/2 = 9
        expect(v.tenkan).toBe(9);
    });
});
