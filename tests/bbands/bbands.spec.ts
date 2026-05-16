import { BollingerBands } from '../../src/bands';
import { BollingerBands as BollingerBands2 } from 'technicalindicators';
import { bbandsValues, ohlc } from './excel-data';

describe('Bollinger Bands', () => {
    it('Excel Validate', () => {
        const bb = new BollingerBands(20);
        const EPSILON = 0.009;

        ohlc.forEach((tick, idx) => {
            const calculated = bb.nextValue(tick.c);
            const excel = bbandsValues[idx];

            if (!excel && !calculated) {
                expect(excel).toEqual(calculated);
            } else {
                expect(Math.abs(calculated!.upper - excel!.upper)).toBeLessThan(EPSILON);
                expect(Math.abs(calculated!.middle - excel!.middle)).toBeLessThan(EPSILON);
                expect(Math.abs(calculated!.lower - excel!.lower)).toBeLessThan(EPSILON);
            }
        });
    });

    it('Cross sdk validate', () => {
        const bb1 = new BollingerBands(14);
        const bb2 = new BollingerBands2({ period: 14, stdDev: 2, values: [] });

        ohlc.forEach((tick) => {
            const local = bb1.nextValue(tick.c);
            const cross = bb2.nextValue(tick.c);

            expect(Math.abs((local?.lower || 0) - (cross?.lower || 0))).toBeLessThan(0.000001);
            expect(Math.abs((local?.middle || 0) - (cross?.middle || 0))).toBeLessThan(0.000001);
            expect(Math.abs((local?.upper || 0) - (cross?.upper || 0))).toBeLessThan(0.000001);
        });
    });
});
