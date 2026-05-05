import { VWMA } from '../../src/vwma';
import { calculateVWMA } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('VWMA cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=20)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateVWMA(bars, { length: 20, src: 'close', offset: 0 }));

        const vwma = new VWMA(20);
        const debut = bars.map((b) => vwma.nextValue(b.close, b.volume));

        assertSeriesMatch(debut, lwc, 1e-9, 'VWMA');
    });

    it('matches lightweight-charts-indicators (length=50)', () => {
        const bars = genBars(800, 17);
        const lwc = plotValues(calculateVWMA(bars, { length: 50, src: 'close', offset: 0 }));

        const vwma = new VWMA(50);
        const debut = bars.map((b) => vwma.nextValue(b.close, b.volume));

        assertSeriesMatch(debut, lwc, 1e-9, 'VWMA');
    });
});
