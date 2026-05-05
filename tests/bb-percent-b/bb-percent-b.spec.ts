import { BBPercentB } from '../../src/bb-percent-b';
import { calculateBBPercentB } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('BB %B cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=20, mult=2)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateBBPercentB(bars, { length: 20, src: 'close', mult: 2 }));
        const bb = new BBPercentB(20, 2);
        const debut = bars.map((b) => bb.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'BBPercentB');
    });

    it('matches lightweight-charts-indicators (length=14, mult=2.5)', () => {
        const bars = genBars(500, 31);
        const lwc = plotValues(calculateBBPercentB(bars, { length: 14, src: 'close', mult: 2.5 }));
        const bb = new BBPercentB(14, 2.5);
        const debut = bars.map((b) => bb.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'BBPercentB');
    });
});
