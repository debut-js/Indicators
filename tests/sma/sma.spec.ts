import { SMA } from '../../src/sma';
import { SMA as SMA2 } from 'technicalindicators';

describe('Simple Moving Average', () => {
    const ticks = [120, 150, 240, 540, 210, 380, 120, 870, 250, 1100, 500, 950];
    // Interval = 2
    const interval2 = [undefined, 135, 195, 390, 375, 295, 250, 495, 560, 675, 800, 725];
    // Interval = 4
    const interval4 = [undefined, undefined, undefined, 262.5, 285, 342.5, 312.5, 395, 405, 585, 680, 700];
    // Interval = 6
    const interval6 = [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        273.333333333333,
        273.333333333333,
        393.333333333333,
        395,
        488.333333333333,
        536.666666666667,
        631.666666666667,
    ];

    const sma2 = new SMA(2);
    const sma4 = new SMA(4);
    const sma6 = new SMA(6);
    const EPSILON = 0.0001;

    it('Excel validate', () => {
        ticks.forEach((tick, idx) => {
            const sma2Calc = sma2.nextValue(tick);
            const sma4Calc = sma4.nextValue(tick);
            const sma6Calc = sma6.nextValue(tick);

            if (interval2[idx]) {
                expect(Math.abs(sma2Calc - interval2[idx])).toBeLessThan(EPSILON);
            }

            if (interval4[idx]) {
                expect(Math.abs(sma4Calc - interval4[idx])).toBeLessThan(EPSILON);
            }

            if (interval6[idx]) {
                expect(Math.abs(sma6Calc - interval6[idx])).toBeLessThan(EPSILON);
            }
        });
    });

    it('Cross validate', () => {
        const localSMA = new SMA(6);
        const crossSMA = new SMA2({ period: 6, values: [] });

        ticks.forEach((tick) => {
            const calc = localSMA.nextValue(tick);
            const cross = crossSMA.nextValue(tick);

            expect(calc).toEqual(cross);
        });
    });

    // https://github.com/debut-js/Indicators/issues/38
    it('momentValue on the bar that would first fill the window matches nextValue on that bar', () => {
        const period = 10;
        const sma = new SMA(period);
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (const v of values) {
            expect(sma.nextValue(v)).toBeUndefined();
        }
        const tenth = 42;
        const m = sma.momentValue(tenth) as number;
        const sma2 = new SMA(period);
        for (const v of values) sma2.nextValue(v);
        const n = sma2.nextValue(tenth) as number;
        expect(m).toBeCloseTo(n, 10);
    });
});
