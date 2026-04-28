import { CMO } from '../../src/cmo';

describe('CMO', () => {
    it('matches hand calculation for period 2', () => {
        const cmo = new CMO(2);
        expect(cmo.nextValue(100)).toBeUndefined();
        expect(cmo.nextValue(102)).toBeUndefined();
        const v = cmo.nextValue(101);
        // diffs: +2, -1 -> gains 2, losses 1 -> 100 * (2-1) / 3
        expect(v).toBeCloseTo(100 / 3, 5);
    });

    it('returns 0 when gains and losses cancel in denominator edge', () => {
        const cmo = new CMO(1);
        cmo.nextValue(10);
        const v = cmo.nextValue(10);
        expect(v).toBe(0);
    });

    it('momentValue matches a fresh instance with the same history', () => {
        const seq = [10, 11, 12, 11, 10];
        const a = new CMO(3);
        for (const x of seq) a.nextValue(x);
        const b = new CMO(3);
        for (const x of seq) b.nextValue(x);
        expect(b.momentValue(11)).toBeCloseTo(a.momentValue(11) as number, 10);
    });
});
