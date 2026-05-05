import { ChandeKrollStop } from '../../src/chande-kroll-stop';
import { calculateChandeKrollStop } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('ChandeKrollStop cross-SDK', () => {
    it('matches LWC (defaults 10/1/9)', () => {
        const bars = genBars(400);
        const atrLength = 10;
        const stopLength = 9;
        const result = calculateChandeKrollStop(bars, { atrLength, atrCoeff: 1, stopLength });
        // plot0 = stopLong, plot1 = stopShort
        const lwcLong = plotValues(result, 'plot0');
        const lwcShort = plotValues(result, 'plot1');

        const cks = new ChandeKrollStop(atrLength, 1, stopLength);
        const debutLong: Array<number | undefined> = [];
        const debutShort: Array<number | undefined> = [];
        for (const b of bars) {
            const out = cks.nextValue(b.high, b.low, b.close);
            debutLong.push(out?.stopLong);
            debutShort.push(out?.stopShort);
        }

        // LWC's `ta.highest`/`ta.lowest` emit a partial-window value
        // (skipping NaN inputs) once the outer window opens, while
        // debut waits for a fully-populated buffer. Compare from the
        // first bar where both implementations agree on validity —
        // i.e. once both inner highest/lowest and the outer stop
        // window are fully primed.
        const firstFullBar = atrLength - 1 + stopLength - 1;
        assertSeriesMatch(
            debutLong.slice(firstFullBar),
            lwcLong.slice(firstFullBar),
            1e-9,
            'CKS.long',
        );
        assertSeriesMatch(
            debutShort.slice(firstFullBar),
            lwcShort.slice(firstFullBar),
            1e-9,
            'CKS.short',
        );
    });
});
