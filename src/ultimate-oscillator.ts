import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Ultimate Oscillator
 *
 * Combines short, intermediate, and long-term price action into one oscillator.
 *
 * UO = 100 * (4 * avg7 + 2 * avg14 + avg28) / (4 + 2 + 1)
 * Where avgN = sum(BP, N) / sum(TR, N)
 * BP = Close - min(Low, PrevClose)
 * TR = max(High, PrevClose) - min(Low, PrevClose)
 */
export class UltimateOscillator  implements StatefulIndicator<GenericIndicatorState> {
    private bp7: CircularBuffer;
    private tr7: CircularBuffer;
    private bp14: CircularBuffer;
    private tr14: CircularBuffer;
    private bp28: CircularBuffer;
    private tr28: CircularBuffer;
    private prevClose: number;
    private fill = 0;

    /**
     * @param period1 Short period (default: 7)
     * @param period2 Medium period (default: 14)
     * @param period3 Long period (default: 28)
     */
    constructor(private period1 = 7, private period2 = 14, private period3 = 28) {
        this.bp7 = new CircularBuffer(period1);
        this.tr7 = new CircularBuffer(period1);
        this.bp14 = new CircularBuffer(period2);
        this.tr14 = new CircularBuffer(period2);
        this.bp28 = new CircularBuffer(period3);
        this.tr28 = new CircularBuffer(period3);
    }

    /**
     * Adds a new value and returns the Ultimate Oscillator
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    nextValue(high: number, low: number, close: number) {
        if (this.prevClose === undefined) this.prevClose = close;
        const bp = close - Math.min(low, this.prevClose);
        const tr = Math.max(high, this.prevClose) - Math.min(low, this.prevClose);
        this.bp7.push(bp); this.tr7.push(tr);
        this.bp14.push(bp); this.tr14.push(tr);
        this.bp28.push(bp); this.tr28.push(tr);
        this.prevClose = close;
        this.fill++;
        if (this.fill < this.period3) return;
        const avg7 = this.bp7.toArray().reduce((a, b) => a + b, 0) / this.tr7.toArray().reduce((a, b) => a + b, 0);
        const avg14 = this.bp14.toArray().reduce((a, b) => a + b, 0) / this.tr14.toArray().reduce((a, b) => a + b, 0);
        const avg28 = this.bp28.toArray().reduce((a, b) => a + b, 0) / this.tr28.toArray().reduce((a, b) => a + b, 0);
        const uo = 100 * (4 * avg7 + 2 * avg14 + avg28) / 7;
        this.nextValue = (high: number, low: number, close: number) => {
            const bp = close - Math.min(low, this.prevClose);
            const tr = Math.max(high, this.prevClose) - Math.min(low, this.prevClose);
            this.bp7.push(bp); this.tr7.push(tr);
            this.bp14.push(bp); this.tr14.push(tr);
            this.bp28.push(bp); this.tr28.push(tr);
            this.prevClose = close;
            const avg7 = this.bp7.toArray().reduce((a, b) => a + b, 0) / this.tr7.toArray().reduce((a, b) => a + b, 0);
            const avg14 = this.bp14.toArray().reduce((a, b) => a + b, 0) / this.tr14.toArray().reduce((a, b) => a + b, 0);
            const avg28 = this.bp28.toArray().reduce((a, b) => a + b, 0) / this.tr28.toArray().reduce((a, b) => a + b, 0);
            return 100 * (4 * avg7 + 2 * avg14 + avg28) / 7;
        };
        return uo;
    }

    /**
     * Calculates Ultimate Oscillator for the current (not closed) bar without changing the internal state
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    momentValue(high: number, low: number, close: number) {
        const bp = close - Math.min(low, this.prevClose);
        const tr = Math.max(high, this.prevClose) - Math.min(low, this.prevClose);
        const bp7 = this.bp7.toArray().slice(); bp7.push(bp); if (bp7.length > this.period1) bp7.shift();
        const tr7 = this.tr7.toArray().slice(); tr7.push(tr); if (tr7.length > this.period1) tr7.shift();
        const bp14 = this.bp14.toArray().slice(); bp14.push(bp); if (bp14.length > this.period2) bp14.shift();
        const tr14 = this.tr14.toArray().slice(); tr14.push(tr); if (tr14.length > this.period2) tr14.shift();
        const bp28 = this.bp28.toArray().slice(); bp28.push(bp); if (bp28.length > this.period3) bp28.shift();
        const tr28 = this.tr28.toArray().slice(); tr28.push(tr); if (tr28.length > this.period3) tr28.shift();
        const avg7 = bp7.reduce((a, b) => a + b, 0) / tr7.reduce((a, b) => a + b, 0);
        const avg14 = bp14.reduce((a, b) => a + b, 0) / tr14.reduce((a, b) => a + b, 0);
        const avg28 = bp28.reduce((a, b) => a + b, 0) / tr28.reduce((a, b) => a + b, 0);
        return 100 * (4 * avg7 + 2 * avg14 + avg28) / 7;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        restoreObjectState(this, state);
        this.bindFilledNextValue();

        return this;
    }

    private bindFilledNextValue(): void {
        delete (this as any).nextValue;
        if (this.fill < this.period3) return;

        this.nextValue = (high: number, low: number, close: number) => {
            const bp = close - Math.min(low, this.prevClose);
            const tr = Math.max(high, this.prevClose) - Math.min(low, this.prevClose);
            this.bp7.push(bp); this.tr7.push(tr);
            this.bp14.push(bp); this.tr14.push(tr);
            this.bp28.push(bp); this.tr28.push(tr);
            this.prevClose = close;
            const avg7 = this.bp7.toArray().reduce((a, b) => a + b, 0) / this.tr7.toArray().reduce((a, b) => a + b, 0);
            const avg14 = this.bp14.toArray().reduce((a, b) => a + b, 0) / this.tr14.toArray().reduce((a, b) => a + b, 0);
            const avg28 = this.bp28.toArray().reduce((a, b) => a + b, 0) / this.tr28.toArray().reduce((a, b) => a + b, 0);
            return 100 * (4 * avg7 + 2 * avg14 + avg28) / 7;
        };
    }
}
