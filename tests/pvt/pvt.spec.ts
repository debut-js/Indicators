import { PVT } from '../../src/pvt';
import { calculatePVT } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('PVT cross-SDK', () => {
    it('matches lightweight-charts-indicators', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculatePVT(bars));
        const pvt = new PVT();
        const debut = bars.map((b) => pvt.nextValue(b.close, b.volume));
        assertSeriesMatch(debut, lwc, 1e-9, 'PVT');
    });

    it('matches lightweight-charts-indicators on a longer series', () => {
        const bars = genBars(1000, 13);
        const lwc = plotValues(calculatePVT(bars));
        const pvt = new PVT();
        const debut = bars.map((b) => pvt.nextValue(b.close, b.volume));
        assertSeriesMatch(debut, lwc, 1e-9, 'PVT');
    });
});
