import { TEMA } from '../../src/tema';
import { EMA } from '../../src/ema';

describe('TEMA', () => {
    it('momentValue matches 3*e1 - 3*e2 + e3 for the same EMA state', () => {
        const period = 5;
        const e1 = new EMA(period);
        const e2 = new EMA(period);
        const e3 = new EMA(period);
        const tema = new TEMA(period);
        const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
        for (const x of prices) {
            tema.nextValue(x);
            const a = e1.nextValue(x);
            if (a !== undefined) {
                const b = e2.nextValue(a);
                if (b !== undefined) e3.nextValue(b);
            }
        }
        const probe = 22;
        const m1 = e1.momentValue(probe) as number;
        const m2 = e2.momentValue(m1) as number;
        const m3 = e3.momentValue(m2) as number;
        const expected = 3 * m1 - 3 * m2 + m3;
        const actual = tema.momentValue(probe) as number;
        expect(actual).toBeCloseTo(expected, 4);
    });
});
