import { MassIndex } from '../../src/mass-index';
import { calculateMassIndex } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Mass Index cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=10)', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculateMassIndex(bars, { length: 10 }));
        const mi = new MassIndex(10);
        const debut = bars.map((b) => mi.nextValue(b.high, b.low));
        assertSeriesMatch(debut, lwc, 1e-9, 'MassIndex');
    });

    it('matches lightweight-charts-indicators (length=25)', () => {
        const bars = genBars(600, 53);
        const lwc = plotValues(calculateMassIndex(bars, { length: 25 }));
        const mi = new MassIndex(25);
        const debut = bars.map((b) => mi.nextValue(b.high, b.low));
        assertSeriesMatch(debut, lwc, 1e-9, 'MassIndex');
    });
});
