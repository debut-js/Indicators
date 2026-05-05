import { Aroon } from '../../src/aroon';
import { calculateAroon } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Aroon cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=14)', () => {
        const bars = genBars(400);
        const result = calculateAroon(bars, { length: 14 });
        const lwcUp = plotValues(result, 'plot0');
        const lwcDown = plotValues(result, 'plot1');

        const aUp = new Aroon(14);
        const aDown = new Aroon(14);
        const debutUp = bars.map((b) => aUp.nextValue(b.high, b.low)?.up);
        const debutDown = bars.map((b) => aDown.nextValue(b.high, b.low)?.down);

        assertSeriesMatch(debutUp, lwcUp, 1e-9, 'Aroon.up');
        assertSeriesMatch(debutDown, lwcDown, 1e-9, 'Aroon.down');
    });

    it('matches lightweight-charts-indicators (length=25)', () => {
        const bars = genBars(600, 11);
        const result = calculateAroon(bars, { length: 25 });
        const lwcUp = plotValues(result, 'plot0');
        const lwcDown = plotValues(result, 'plot1');

        const aroon = new Aroon(25);
        const debutUp: Array<number | undefined> = [];
        const debutDown: Array<number | undefined> = [];
        for (const b of bars) {
            const v = aroon.nextValue(b.high, b.low);
            debutUp.push(v?.up);
            debutDown.push(v?.down);
        }

        assertSeriesMatch(debutUp, lwcUp, 1e-9, 'Aroon.up');
        assertSeriesMatch(debutDown, lwcDown, 1e-9, 'Aroon.down');
    });
});
