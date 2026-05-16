import { AO } from '../../src/ao';
import { AwesomeOscillator as AO2 } from 'technicalindicators';
import { aoValues, lows, highs } from './excel-data';

describe('AO', () => {
    it('Excel Validate', () => {
        const ao = new AO();

        lows.forEach((l, idx) => {
            const calculated = ao.nextValue(highs[idx], l);
            const excel = aoValues[idx];

            if (!excel && !calculated) {
                expect(excel).toEqual(undefined);
            } else {
                expect(Math.abs(calculated! - excel!)).toBeLessThan(0.0001);
            }
        });
    });

    it('Cross sdk validate', () => {
        const ao = new AO(5, 34);
        const ao2 = new AO2({ fastPeriod: 5, high: [], low: [], slowPeriod: 34 });

        lows.forEach((l, idx) => {
            const priceData = {
                high: highs[idx],
                low: l,
            };

            const local = ao.nextValue(priceData.high, priceData.low);
            const cross = ao2.nextValue(priceData);

            if (!local || !cross) {
                expect(local).toEqual(cross);
            } else {
                expect(Math.abs(local - cross)).toBeLessThan(0.000001);
            }
        });
    });
});
