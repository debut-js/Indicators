import { DC } from '../../src/dc';
import { dcValues, ohlc } from './excel-data';

describe('Donchian Channels', () => {
    it('Excel Validate', () => {
        const dc = new DC(21);
        const EPSILON = 0.001;

        ohlc.forEach((tick, idx) => {
            const calculated = dc.nextValue(tick.h, tick.l);
            const excel = dcValues[idx];

            // console.log(calculated.upper, excel.upper)
            // console.log(calculated.lower, excel.lower)

            if (!calculated) {
                return;
            }

            expect(Math.abs(calculated.upper - excel.upper)).toBeLessThan(EPSILON);
            expect(Math.abs(calculated.lower - excel.lower)).toBeLessThan(EPSILON);
        });
    });
});
