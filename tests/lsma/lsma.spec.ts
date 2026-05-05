import { LSMA } from '../../src/lsma';
import { calculateLSMA } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('LSMA cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=25, offset=0)', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculateLSMA(bars, { length: 25, src: 'close', offset: 0 }));
        const lsma = new LSMA(25, 0);
        const debut = bars.map((b) => lsma.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'LSMA');
    });

    it('matches lightweight-charts-indicators (length=10, offset=0)', () => {
        const bars = genBars(300, 11);
        const lwc = plotValues(calculateLSMA(bars, { length: 10, src: 'close', offset: 0 }));
        const lsma = new LSMA(10, 0);
        const debut = bars.map((b) => lsma.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'LSMA');
    });
});
