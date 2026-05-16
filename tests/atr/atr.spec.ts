import { ATR } from '../../src/atr';
import { ATR as ATR2 } from 'technicalindicators';
import { atrValues, ohlc } from './excel-data';

describe('ATR', () => {
    it('Excel Validate', () => {
        const period = 14;
        const atr = new ATR(period, 'SMA');

        ohlc.forEach((tick, idx) => {
            const calculated = atr.nextValue(tick.h, tick.l, tick.c);
            const excel = atrValues[idx];

            if (idx > period) {
                expect(Math.abs(calculated! - excel!)).toBeLessThan(0.007);
            }
        });
    });

    it('Cross sdk validate', () => {
        const period = 14;
        const atr = new ATR(period);
        const atr2 = new ATR2({ period, high: [], low: [], close: [] });

        const local: Array<number | undefined> = [];
        const cross: Array<number | undefined> = [];

        ohlc.forEach((tick) => {
            local.push(atr.nextValue(tick.h, tick.l, tick.c));
            cross.push(atr2.nextValue({ high: tick.h, low: tick.l, close: tick.c }));
        });

        expect(local).toEqual(cross);
    });
});
