import { SMIErgodic } from '../../src/smi-ergodic';
import { calculateSMIErgodic } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('SMIErgodic cross-SDK', () => {
    it('matches LWC (defaults 20/5/5)', () => {
        const bars = genBars(400);
        const result = calculateSMIErgodic(bars, { longLength: 20, shortLength: 5, signalLength: 5 });
        const lwcSmi = plotValues(result, 'plot0');
        const lwcSig = plotValues(result, 'plot1');

        const smi = new SMIErgodic(20, 5, 5);
        const debutSmi: Array<number | undefined> = [];
        const debutSig: Array<number | undefined> = [];
        for (const b of bars) {
            const out = smi.nextValue(b.close);
            debutSmi.push(out?.smi);
            debutSig.push(out?.signal);
        }
        assertSeriesMatch(debutSmi, lwcSmi, 1e-9, 'SMI');
        assertSeriesMatch(debutSig, lwcSig, 1e-9, 'SMI.signal');
    });
});
