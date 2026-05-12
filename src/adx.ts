import { getTrueRange } from './providers/true-range';
import { WEMA } from './wema';
import { WWS } from './wws';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * ADX values help traders identify the strongest and most profitable trends to trade.
 * The values are also important for distinguishing between trending and non-trending conditions.
 * Many traders will use ADX readings above 25 to suggest that the trend is strong enough for trend-trading strategies.
 * Conversely, when ADX is below 25, many will avoid trend-trading strategies.
 * ADX Value	Trend Strength
 * 0-25	Absent or Weak Trend
 * 25-50	Strong Trend
 * 50-75	Very Strong Trend
 * 75-100	Extremely Strong Trend
 */
export class ADX  implements StatefulIndicator<GenericIndicatorState> {
    private prevHigh: number;
    private prevLow: number;
    private prevClose: number;
    private wma1: WWS;
    private wma2: WWS;
    private wma3: WWS;
    private wema: WEMA;

    constructor(public period: number = 14) {
        this.wma1 = new WWS(period);
        this.wma2 = new WWS(period);
        this.wma3 = new WWS(period);
        this.wema = new WEMA(period);
    }

    nextValue(h: number, l: number, c: number) {
        if (!this.prevClose) {
            this.prevHigh = h;
            this.prevLow = l;
            this.prevClose = c;

            return;
        }

        let pDM = 0;
        let nDM = 0;

        const hDiff = h - this.prevHigh;
        const lDiff = this.prevLow - l;

        if (hDiff > lDiff && hDiff > 0) {
            pDM = hDiff;
        }

        if (lDiff > hDiff && lDiff > 0) {
            nDM = lDiff;
        }

        if (pDM > nDM || nDM < 0) {
            nDM = 0;
        }

        const atr = this.wma1.nextValue(getTrueRange(h, l, this.prevClose));
        const avgPDI = this.wma2.nextValue(pDM);
        const avgNDI = this.wma3.nextValue(nDM);

        this.prevHigh = h;
        this.prevLow = l;
        this.prevClose = c;

        if (avgPDI === undefined || avgNDI === undefined) {
            return;
        }

        const pDI = (avgPDI * 100) / atr;
        const nDI = (avgNDI * 100) / atr;
        const diAbs = pDI > nDI ? pDI - nDI : nDI - pDI;

        return { adx: this.wema.nextValue(100 * (diAbs / (pDI + nDI))), pdi: pDI, mdi: nDI };
    }

    momentValue(h: number, l: number, c: number) {
        if (!this.prevClose) {
            return;
        }

        let pDM = 0;
        let nDM = 0;

        const hDiff = h - this.prevHigh;
        const lDiff = this.prevLow - l;

        if (hDiff > lDiff && hDiff > 0) {
            pDM = hDiff;
        }

        if (lDiff > hDiff && lDiff > 0) {
            nDM = lDiff;
        }

        if (pDM > nDM || nDM < 0) {
            nDM = 0;
        }

        const atr = this.wma1.momentValue(getTrueRange(h, l, this.prevClose));
        const avgPDI = this.wma2.momentValue(pDM);
        const avgNDI = this.wma3.momentValue(nDM);

        if (avgPDI === undefined || avgNDI === undefined) {
            return;
        }

        const pDI = (avgPDI * 100) / atr;
        const nDI = (avgNDI * 100) / atr;
        const diAbs = pDI > nDI ? pDI - nDI : nDI - pDI;

        return { adx: this.wema.momentValue(100 * (diAbs / (pDI + nDI))), pdi: pDI, mdi: nDI };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
