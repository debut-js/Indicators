import { Vortex } from '../../src/vortex';
import { calculateVortex } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Vortex cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=14)', () => {
        const bars = genBars(400);
        const result = calculateVortex(bars, { length: 14 });
        const lwcPlus = plotValues(result, 'plot0');
        const lwcMinus = plotValues(result, 'plot1');

        const v = new Vortex(14);
        const debutPlus: Array<number | undefined> = [];
        const debutMinus: Array<number | undefined> = [];
        for (const b of bars) {
            const out = v.nextValue(b.high, b.low, b.close);
            debutPlus.push(out?.plus);
            debutMinus.push(out?.minus);
        }

        assertSeriesMatch(debutPlus, lwcPlus, 1e-9, 'Vortex.plus');
        assertSeriesMatch(debutMinus, lwcMinus, 1e-9, 'Vortex.minus');
    });

    it('matches lightweight-charts-indicators (length=21)', () => {
        const bars = genBars(600, 67);
        const result = calculateVortex(bars, { length: 21 });
        const lwcPlus = plotValues(result, 'plot0');
        const lwcMinus = plotValues(result, 'plot1');

        const v = new Vortex(21);
        const debutPlus: Array<number | undefined> = [];
        const debutMinus: Array<number | undefined> = [];
        for (const b of bars) {
            const out = v.nextValue(b.high, b.low, b.close);
            debutPlus.push(out?.plus);
            debutMinus.push(out?.minus);
        }

        assertSeriesMatch(debutPlus, lwcPlus, 1e-9, 'Vortex.plus');
        assertSeriesMatch(debutMinus, lwcMinus, 1e-9, 'Vortex.minus');
    });
});
