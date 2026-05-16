import { ohlc, rsiValues } from './excel-data';
import { RSI } from '../../src/rsi';
import { RSI as RSI2 } from 'technicalindicators';

describe('RSI', () => {
    it('Excel Validate', () => {
        const bb = new RSI();
        const EPSILON = 0.001;

        ohlc.forEach((tick, idx) => {
            const calculated = bb.nextValue(tick.c);
            const excel = rsiValues[idx];

            if (!excel && !calculated) {
                expect(excel).toEqual(calculated);
            } else {
                expect(Math.abs(calculated! - excel!)).toBeLessThan(EPSILON);
            }
        });
    });

    it('Cross sdk validate', () => {
        const rsi = new RSI();
        const rsi2 = new RSI2({ period: 14, values: [] });

        ohlc.forEach((tick) => {
            const local = rsi.nextValue(tick.c);
            const cross = rsi2.nextValue(tick.c);

            if (!local || !cross) {
                expect(local).toEqual(cross);
            } else {
                expect(Math.abs(local - cross)).toBeLessThan(0.01);
            }
        });
    });
});
