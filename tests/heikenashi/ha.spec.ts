import { haValues, ohlc } from './excel-data';
import { HeikenAshi } from '../../src/heiken-ashi';
import { HeikinAshi as HeikenAshi2 } from 'technicalindicators';

describe('Heiken Ashi', () => {
    it('Excel Validate', () => {
        const ha = new HeikenAshi();
        const EPSILON = 0.008;

        ohlc.forEach((tick, idx) => {
            const calculated = ha.nextValue(tick.o, tick.h, tick.l, tick.c);
            const excel = haValues[idx];

            expect(Math.abs(calculated.o - excel.o)).toBeLessThan(EPSILON);
            expect(Math.abs(calculated.h - excel.h)).toBeLessThan(EPSILON);
            expect(Math.abs(calculated.l - excel.l)).toBeLessThan(EPSILON);
            expect(Math.abs(calculated.c - excel.c)).toBeLessThan(EPSILON);
        });
    });

    it('Cross SDK Validate', () => {
        const ha = new HeikenAshi();
        const first = ohlc[0];
        const ha2 = new HeikenAshi2({ open: [first.o], high: [first.h], low: [first.l], close: [first.c] });
        const EPSILON = 0.000001;

        ohlc.forEach((tick, idx) => {
            const calculated = ha.nextValue(tick.o, tick.h, tick.l, tick.c);

            if (idx == 0) {
                return;
            }

            const cross = ha2.nextValue({ open: tick.o, high: tick.h, low: tick.l, close: tick.c });

            expect(calculated!.o - cross!.open!).toBeLessThan(EPSILON);
            expect(calculated!.h - cross!.high!).toBeLessThan(EPSILON);
            expect(calculated!.l - cross!.low!).toBeLessThan(EPSILON);
            expect(calculated!.c - cross!.close!).toBeLessThan(EPSILON);
        });
    });
});
