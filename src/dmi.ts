import { getTrueRange } from './providers/true-range';
import { WEMA } from './wema';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Directional Movement Index (DMI)
 *
 * DMI consists of two lines: +DI and -DI, which help identify trend direction and strength.
 * Optionally, ADX can be included to measure trend strength.
 *
 * - +DI: Smoothed positive directional movement
 * - -DI: Smoothed negative directional movement
 * - ADX: Average Directional Index (optional)
 */
export class DMI  implements StatefulIndicator<GenericIndicatorState> {
    private prevHigh: number;
    private prevLow: number;
    private prevClose: number;
    private wemaP: WEMA;
    private wemaN: WEMA;
    private wemaADX: WEMA;

    /**
     * @param period Period for smoothing (default: 14)
     * @param withADX Whether to calculate ADX as well (default: false)
     */
    constructor(public period: number = 14, private withADX = false) {
        this.wemaP = new WEMA(period);
        this.wemaN = new WEMA(period);
        this.wemaADX = new WEMA(period);
    }

    /**
     * Adds a new value and returns DMI (+DI, -DI, optionally ADX)
     * @param h High price of the current bar
     * @param l Low price of the current bar
     * @param c Close price of the current bar
     */
    nextValue(h: number, l: number, c: number) {
        if (this.prevClose === undefined) {
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
        const atr = getTrueRange(h, l, this.prevClose);
        const avgPDM = this.wemaP.nextValue(pDM);
        const avgNDM = this.wemaN.nextValue(nDM);
        this.prevHigh = h;
        this.prevLow = l;
        this.prevClose = c;
        if (avgPDM === undefined || avgNDM === undefined || atr === 0) {
            return;
        }
        const plusDI = (avgPDM * 100) / atr;
        const minusDI = (avgNDM * 100) / atr;
        if (!this.withADX) {
            return { plusDI, minusDI };
        }
        const diDiff = Math.abs(plusDI - minusDI);
        const diSum = plusDI + minusDI;
        const adx = this.wemaADX.nextValue(100 * (diDiff / diSum));
        return { plusDI, minusDI, adx };
    }

    /**
     * Calculates DMI for the current (not closed) bar without changing the internal state
     * @param h High price of the current bar
     * @param l Low price of the current bar
     * @param c Close price of the current bar
     */
    momentValue(h: number, l: number, c: number) {
        if (this.prevClose === undefined) {
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
        const atr = getTrueRange(h, l, this.prevClose);
        const avgPDM = this.wemaP.momentValue(pDM);
        const avgNDM = this.wemaN.momentValue(nDM);
        if (avgPDM === undefined || avgNDM === undefined || atr === 0) {
            return;
        }
        const plusDI = (avgPDM * 100) / atr;
        const minusDI = (avgNDM * 100) / atr;
        if (!this.withADX) {
            return { plusDI, minusDI };
        }
        const diDiff = Math.abs(plusDI - minusDI);
        const diSum = plusDI + minusDI;
        const adx = this.wemaADX.momentValue(100 * (diDiff / diSum));
        return { plusDI, minusDI, adx };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
} 