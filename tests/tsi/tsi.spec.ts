import { TSI } from '../../src/tsi';
import { calculateTSI } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('TSI cross-SDK', () => {
    it('matches lightweight-charts-indicators (defaults 25/13/13)', () => {
        const bars = genBars(400);
        const lwcResult = calculateTSI(bars, { longLength: 25, shortLength: 13, signalLength: 13 });
        const lwcTsi = plotValues(lwcResult, 'plot0');
        const lwcSignal = plotValues(lwcResult, 'plot1');

        const tsi = new TSI(25, 13, 13);
        const debutTsi = bars.map((b) => tsi.nextValue(b.close)?.tsi);
        // Re-run to capture signal stream (separate instance keeps streams independent).
        const tsi2 = new TSI(25, 13, 13);
        const debutSignal = bars.map((b) => tsi2.nextValue(b.close)?.signal);

        assertSeriesMatch(debutTsi, lwcTsi, 1e-9, 'TSI.tsi');
        assertSeriesMatch(debutSignal, lwcSignal, 1e-9, 'TSI.signal');
    });

    it('matches lightweight-charts-indicators (10/5/5)', () => {
        const bars = genBars(300, 23);
        const lwcResult = calculateTSI(bars, { longLength: 10, shortLength: 5, signalLength: 5 });
        const lwcTsi = plotValues(lwcResult, 'plot0');
        const lwcSignal = plotValues(lwcResult, 'plot1');

        const tsi = new TSI(10, 5, 5);
        const debutTsi: Array<number | undefined> = [];
        const debutSignal: Array<number | undefined> = [];
        for (const b of bars) {
            const v = tsi.nextValue(b.close);
            debutTsi.push(v?.tsi);
            debutSignal.push(v?.signal);
        }

        assertSeriesMatch(debutTsi, lwcTsi, 1e-9, 'TSI.tsi');
        assertSeriesMatch(debutSignal, lwcSignal, 1e-9, 'TSI.signal');
    });
});
