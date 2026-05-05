import { Median } from '../../src/median';
import { calculateMedian } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Median cross-SDK', () => {
    it('matches LWC plot0 (length=3)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateMedian(bars, { length: 3, atrLength: 14, atrMult: 2 }), 'plot0');
        const m = new Median(3);
        const debut = bars.map((b) => m.nextValue(b.high, b.low));
        assertSeriesMatch(debut, lwc, 1e-12, 'Median');
    });

    it('matches LWC plot0 (length=7)', () => {
        const bars = genBars(500, 59);
        const lwc = plotValues(calculateMedian(bars, { length: 7, atrLength: 14, atrMult: 2 }), 'plot0');
        const m = new Median(7);
        const debut = bars.map((b) => m.nextValue(b.high, b.low));
        assertSeriesMatch(debut, lwc, 1e-12, 'Median');
    });
});
