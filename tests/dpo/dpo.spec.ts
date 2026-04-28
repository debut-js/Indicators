import { DPO } from '../../src/dpo';

describe('DPO', () => {
    it('returns undefined until period + shift bars', () => {
        const dpo = new DPO(4);
        const shift = Math.floor(4 / 2 + 1);
        for (let i = 0; i < 4 + shift - 1; i++) {
            expect(dpo.nextValue(100 + i)).toBeUndefined();
        }
        const v = dpo.nextValue(100 + 4 + shift - 1);
        expect(v).toBeDefined();
        expect(typeof v).toBe('number');
    });

    it('momentValue is stable with nextValue series', () => {
        const dpo = new DPO(5);
        const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        for (const p of prices) dpo.nextValue(p);
        const m = dpo.momentValue(11);
        const dpo2 = new DPO(5);
        for (let i = 0; i < prices.length; i++) dpo2.nextValue(prices[i]);
        const without = dpo2.momentValue(11);
        expect(m).toBeCloseTo(without as number, 10);
    });
});
