import { OBV } from '../../src/obv';
import { calculateOBV } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('OBV cross-SDK', () => {
    it('matches lightweight-charts-indicators (no smoothing)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateOBV(bars, { maType: 'None' }));

        const obv = new OBV();
        const debut = bars.map((b) => obv.nextValue(b.close, b.volume));

        assertSeriesMatch(debut, lwc, 1e-9, 'OBV');
    });

    it('matches lightweight-charts-indicators on a longer series', () => {
        const bars = genBars(1000, 13);
        const lwc = plotValues(calculateOBV(bars, { maType: 'None' }));

        const obv = new OBV();
        const debut = bars.map((b) => obv.nextValue(b.close, b.volume));

        assertSeriesMatch(debut, lwc, 1e-9, 'OBV');
    });
});
