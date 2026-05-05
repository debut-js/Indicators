import { DEMA } from '../../src/dema';
import { calculateDEMA } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('DEMA cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=9)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateDEMA(bars, { length: 9, offset: 0 }));

        const dema = new DEMA(9);
        const debut = bars.map((b) => dema.nextValue(b.close));

        assertSeriesMatch(debut, lwc, 1e-9, 'DEMA');
    });

    it('matches lightweight-charts-indicators (length=20)', () => {
        const bars = genBars(500, 11);
        const lwc = plotValues(calculateDEMA(bars, { length: 20, offset: 0 }));

        const dema = new DEMA(20);
        const debut = bars.map((b) => dema.nextValue(b.close));

        assertSeriesMatch(debut, lwc, 1e-9, 'DEMA');
    });
});
