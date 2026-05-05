import { FisherTransform } from '../../src/fisher-transform';
import { calculateFisherTransform } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Fisher Transform cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=9)', () => {
        const bars = genBars(400);
        const result = calculateFisherTransform(bars, { length: 9 });
        const lwcFisher = plotValues(result, 'plot0');
        const lwcTrigger = plotValues(result, 'plot1');

        const ft = new FisherTransform(9);
        const debutFisher: Array<number | undefined> = [];
        const debutTrigger: Array<number | undefined> = [];
        for (const b of bars) {
            const out = ft.nextValue(b.high, b.low);
            debutFisher.push(out.fisher);
            debutTrigger.push(out.trigger);
        }
        assertSeriesMatch(debutFisher, lwcFisher, 1e-9, 'Fisher');
        assertSeriesMatch(debutTrigger, lwcTrigger, 1e-9, 'Trigger');
    });

    it('matches lightweight-charts-indicators (length=14)', () => {
        const bars = genBars(300, 19);
        const result = calculateFisherTransform(bars, { length: 14 });
        const lwcFisher = plotValues(result, 'plot0');

        const ft = new FisherTransform(14);
        const debutFisher = bars.map((b) => ft.nextValue(b.high, b.low).fisher);
        assertSeriesMatch(debutFisher, lwcFisher, 1e-9, 'Fisher');
    });
});
