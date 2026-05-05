import { NetVolume } from '../../src/net-volume';
import { calculateNetVolume } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('NetVolume cross-SDK', () => {
    it('matches LWC', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculateNetVolume(bars));
        const nv = new NetVolume();
        const debut = bars.map((b) => nv.nextValue(b.open, b.close, b.volume));
        assertSeriesMatch(debut, lwc, 1e-12, 'NetVolume');
    });
});
