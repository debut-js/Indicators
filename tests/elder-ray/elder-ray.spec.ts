import { ElderRay } from '../../src/elder-ray';

describe('ElderRay', () => {
    it('bull and bear recompute on each nextValue after warmup', () => {
        const er = new ElderRay(3);
        er.nextValue(95, 90, 100);
        er.nextValue(100, 95, 100);
        const a = er.nextValue(105, 100, 102) as { bull: number; bear: number };
        const b = er.nextValue(110, 100, 104) as { bull: number; bear: number };
        expect(b.bull).toBeGreaterThan(a.bull);
    });

    it('momentValue on a new bar matches nextValue when EMA is already warmed', () => {
        const period = 4;
        const er = new ElderRay(period);
        for (let i = 0; i < period - 1; i++) {
            er.nextValue(10 + i, 9 + i, 9.5 + i);
        }
        er.nextValue(20, 8, 12);
        const m = er.momentValue(22, 7, 13) as { bull: number; bear: number };
        const v = er.nextValue(22, 7, 13) as { bull: number; bear: number };
        expect(v.bull).toBeCloseTo(m.bull, 5);
        expect(v.bear).toBeCloseTo(m.bear, 5);
    });
});
