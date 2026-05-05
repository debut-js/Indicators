import { KST } from '../../src/kst';
import { calculateKST } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('KST cross-SDK', () => {
    it('matches lightweight-charts-indicators (defaults)', () => {
        const bars = genBars(500);
        const result = calculateKST(bars, {
            roclen1: 10, roclen2: 15, roclen3: 20, roclen4: 30,
            smalen1: 10, smalen2: 10, smalen3: 10, smalen4: 15,
            siglen: 9,
        });
        const lwcKst = plotValues(result, 'plot0');
        const lwcSig = plotValues(result, 'plot1');

        const kst = new KST();
        const debutKst: Array<number | undefined> = [];
        const debutSig: Array<number | undefined> = [];
        for (const b of bars) {
            const out = kst.nextValue(b.close);
            debutKst.push(out?.kst);
            debutSig.push(out?.signal);
        }
        assertSeriesMatch(debutKst, lwcKst, 1e-9, 'KST.kst');
        assertSeriesMatch(debutSig, lwcSig, 1e-9, 'KST.signal');
    });
});
