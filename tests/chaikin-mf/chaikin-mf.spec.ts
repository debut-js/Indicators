import { ChaikinMF } from '../../src/chaikin-mf';
import { calculateChaikinMF } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Chaikin Money Flow cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=20)', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculateChaikinMF(bars, { length: 20 }));
        const cmf = new ChaikinMF(20);
        const debut = bars.map((b) => cmf.nextValue(b.high, b.low, b.close, b.volume));
        assertSeriesMatch(debut, lwc, 1e-9, 'CMF');
    });

    it('matches lightweight-charts-indicators (length=14)', () => {
        const bars = genBars(300, 23);
        const lwc = plotValues(calculateChaikinMF(bars, { length: 14 }));
        const cmf = new ChaikinMF(14);
        const debut = bars.map((b) => cmf.nextValue(b.high, b.low, b.close, b.volume));
        assertSeriesMatch(debut, lwc, 1e-9, 'CMF');
    });
});
