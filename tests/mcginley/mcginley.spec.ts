import { McGinleyDynamic } from '../../src/mcginley-dynamic';
import { calculateMcGinleyDynamic } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('McGinley Dynamic cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=14)', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculateMcGinleyDynamic(bars, { length: 14, src: 'close' }));
        const md = new McGinleyDynamic(14);
        const debut = bars.map((b) => md.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'McGinleyDynamic');
    });

    it('matches lightweight-charts-indicators (length=20)', () => {
        const bars = genBars(500, 5);
        const lwc = plotValues(calculateMcGinleyDynamic(bars, { length: 20, src: 'close' }));
        const md = new McGinleyDynamic(20);
        const debut = bars.map((b) => md.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'McGinleyDynamic');
    });
});
