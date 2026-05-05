import { BBBandWidth } from '../../src/bb-bandwidth';
import { calculateBBBandwidth } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('BBW cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=20, mult=2)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateBBBandwidth(bars, { length: 20, src: 'close', mult: 2 }));
        const bbw = new BBBandWidth(20, 2);
        const debut = bars.map((b) => bbw.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'BBW');
    });

    it('matches lightweight-charts-indicators (length=50, mult=2)', () => {
        const bars = genBars(800, 19);
        const lwc = plotValues(calculateBBBandwidth(bars, { length: 50, src: 'close', mult: 2 }));
        const bbw = new BBBandWidth(50, 2);
        const debut = bars.map((b) => bbw.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'BBW');
    });
});
