import { CCI } from '../../src/cci';
import { CCI as CCI2 } from 'technicalindicators';
import { cciValues, ohlc } from './excel-data';

describe('CCI', () => {
    it('Excel Validate', () => {
        const cci = new CCI(20);
        ohlc.forEach((tick, idx) => {
            const calculated = cci.nextValue(tick.h, tick.l, tick.c);
            const excel = cciValues[idx];

            if (!excel && !calculated) {
                expect(excel).toEqual(calculated);
            } else {
                expect(Math.abs(calculated! - excel!)).toBeLessThan(0.007);
            }
        });
    });

    it('Cross sdk validate', () => {
        const atr = new CCI(14);
        const atr2 = new CCI2({ period: 14, high: [], low: [], close: [] });

        ohlc.forEach((tick) => {
            const local = atr.nextValue(tick.h, tick.l, tick.c);
            const cross = atr2.nextValue({ high: tick.h, low: tick.l, close: tick.c });

            expect(local).toEqual(cross);
        });
    });
});
