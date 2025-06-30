import { getMax, getMin } from './utils';
import { CircularBuffer } from './providers/circular-buffer';

/**
 * Ichimoku Cloud (Ichimoku Kinko Hyo)
 *
 * Lines:
 * - Tenkan-sen (Conversion Line): (max(high, 9) + min(low, 9)) / 2
 * - Kijun-sen (Base Line): (max(high, 26) + min(low, 26)) / 2
 * - Senkou Span A: (Tenkan-sen + Kijun-sen) / 2, shifted forward by 26
 * - Senkou Span B: (max(high, 52) + min(low, 52)) / 2, shifted forward by 26
 * - Chikou Span: close, shifted backward by 26
 */
export class Ichimoku {
    private highs9: CircularBuffer;
    private lows9: CircularBuffer;
    private highs26: CircularBuffer;
    private lows26: CircularBuffer;
    private highs52: CircularBuffer;
    private lows52: CircularBuffer;
    private closes: CircularBuffer;

    private tenkan: number;
    private kijun: number;
    private senkouA: number[] = [];
    private senkouB: number[] = [];
    private chikou: number[] = [];

    constructor(
        private periodTenkan = 9,
        private periodKijun = 26,
        private periodSenkouB = 52,
        private displacement = 26
    ) {
        this.highs9 = new CircularBuffer(periodTenkan);
        this.lows9 = new CircularBuffer(periodTenkan);
        this.highs26 = new CircularBuffer(periodKijun);
        this.lows26 = new CircularBuffer(periodKijun);
        this.highs52 = new CircularBuffer(periodSenkouB);
        this.lows52 = new CircularBuffer(periodSenkouB);
        this.closes = new CircularBuffer(displacement + 1); // for Chikou Span
    }

    /**
     * Adds a new value and returns an object with Ichimoku lines
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    nextValue(high: number, low: number, close: number) {
        this.highs9.push(high);
        this.lows9.push(low);
        this.highs26.push(high);
        this.lows26.push(low);
        this.highs52.push(high);
        this.lows52.push(low);
        this.closes.push(close);

        if (!this.highs9.filled || !this.highs26.filled || !this.highs52.filled) {
            return;
        }

        this.tenkan = (getMax(this.highs9.toArray()) + getMin(this.lows9.toArray())) / 2;
        this.kijun = (getMax(this.highs26.toArray()) + getMin(this.lows26.toArray())) / 2;
        const senkouA = (this.tenkan + this.kijun) / 2;
        const senkouB = (getMax(this.highs52.toArray()) + getMin(this.lows52.toArray())) / 2;

        this.senkouA.push(senkouA);
        this.senkouB.push(senkouB);
        if (this.senkouA.length > this.displacement) this.senkouA.shift();
        if (this.senkouB.length > this.displacement) this.senkouB.shift();

        // Chikou Span (close, shifted backward by displacement)
        this.chikou.unshift(close);
        if (this.chikou.length > this.displacement) this.chikou.length = this.displacement;

        return {
            tenkan: this.tenkan,
            kijun: this.kijun,
            senkouA: this.senkouA[0], // current Senkou A (forward shift is handled on chart)
            senkouB: this.senkouB[0], // current Senkou B
            chikou: this.chikou[this.displacement - 1] // close, shifted backward
        };
    }

    /**
     * Calculates Ichimoku values for the current (not closed) bar without changing the internal state
     * @param high High price of the current bar
     * @param low Low price of the current bar
     * @param close Close price of the current bar
     */
    momentValue(high: number, low: number, close: number) {
        // Copy buffer contents and add the current value
        const highs9 = this.highs9.toArray().slice();
        const lows9 = this.lows9.toArray().slice();
        const highs26 = this.highs26.toArray().slice();
        const lows26 = this.lows26.toArray().slice();
        const highs52 = this.highs52.toArray().slice();
        const lows52 = this.lows52.toArray().slice();
        const closes = this.closes.toArray().slice();

        if (highs9.length === this.periodTenkan) highs9.shift();
        if (lows9.length === this.periodTenkan) lows9.shift();
        if (highs26.length === this.periodKijun) highs26.shift();
        if (lows26.length === this.periodKijun) lows26.shift();
        if (highs52.length === this.periodSenkouB) highs52.shift();
        if (lows52.length === this.periodSenkouB) lows52.shift();
        if (closes.length === this.displacement + 1) closes.shift();

        highs9.push(high);
        lows9.push(low);
        highs26.push(high);
        lows26.push(low);
        highs52.push(high);
        lows52.push(low);
        closes.push(close);

        if (
            highs9.length < this.periodTenkan ||
            highs26.length < this.periodKijun ||
            highs52.length < this.periodSenkouB
        ) {
            return;
        }

        const tenkan = (getMax(highs9) + getMin(lows9)) / 2;
        const kijun = (getMax(highs26) + getMin(lows26)) / 2;
        const senkouA = (tenkan + kijun) / 2;
        const senkouB = (getMax(highs52) + getMin(lows52)) / 2;

        // For moment calculation, we can't shift Senkou lines forward, but we return the current values
        // Chikou Span: close, shifted backward by displacement
        const chikouIdx = closes.length - 1 - this.displacement;
        const chikou = chikouIdx >= 0 ? closes[chikouIdx] : undefined;

        return {
            tenkan,
            kijun,
            senkouA,
            senkouB,
            chikou
        };
    }
} 