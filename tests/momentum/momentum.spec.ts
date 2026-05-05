import { Momentum } from '../../src/momentum';
import { calculateMomentum } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Momentum cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=10)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateMomentum(bars, { length: 10, src: 'close' }));
        const m = new Momentum(10);
        const debut = bars.map((b) => m.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-12, 'Momentum');
    });

    it('matches lightweight-charts-indicators (length=25)', () => {
        const bars = genBars(500, 41);
        const lwc = plotValues(calculateMomentum(bars, { length: 25, src: 'close' }));
        const m = new Momentum(25);
        const debut = bars.map((b) => m.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-12, 'Momentum');
    });
});
