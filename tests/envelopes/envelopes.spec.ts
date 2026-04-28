import { Envelopes } from '../../src/envelopes';
import { SMA as SMA2 } from 'technicalindicators';
import { closes } from '../macd/excel-data';

describe('Envelopes', () => {
    it('produces symmetric bands around SMA', () => {
        const e = new Envelopes(3, 10);
        e.nextValue(10);
        e.nextValue(10);
        const v = e.nextValue(10) as { lower: number; middle: number; upper: number };
        expect(v.middle).toBe(10);
        expect(v.upper).toBe(11);
        expect(v.lower).toBe(9);
    });

    it('momentValue uses the same middle as SMA.momentValue', () => {
        const e = new Envelopes(4, 2);
        e.nextValue(1);
        e.nextValue(2);
        e.nextValue(3);
        e.nextValue(4);
        const m = e.momentValue(5) as { lower: number; middle: number; upper: number };
        expect(m.middle * 0.02).toBeCloseTo((m.upper - m.middle), 8);
        expect(m.middle * 0.02).toBeCloseTo((m.middle - m.lower), 8);
    });

    it('Cross sdk: middle band matches technicalindicators SMA', () => {
        const period = 20;
        const pct = 2.5;
        const env = new Envelopes(period, pct);
        const refSma = new SMA2({ period, values: [] });
        closes.forEach((c) => {
            const e = env.nextValue(c) as { lower: number; middle: number; upper: number } | undefined;
            const m = refSma.nextValue(c);
            if (e && m !== undefined) {
                expect(e.middle).toBeCloseTo(m, 8);
            }
        });
    });
});
