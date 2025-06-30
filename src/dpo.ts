import { SMA } from './sma';
import { CircularBuffer } from './providers/circular-buffer';

/**
 * Detrended Price Oscillator (DPO)
 *
 * DPO = Price - SMA(shifted)
 *
 * The SMA is shifted back by (period / 2 + 1) bars.
 */
export class DPO {
    private sma: SMA;
    private buffer: CircularBuffer;
    private shift: number;
    private fill = 0;

    /**
     * @param period Period for SMA (default: 20)
     */
    constructor(private period = 20) {
        this.sma = new SMA(period);
        this.shift = Math.floor(period / 2 + 1);
        this.buffer = new CircularBuffer(this.shift + 1);
    }

    /**
     * Adds a new value and returns the DPO
     * @param value Input value (e.g., close price)
     */
    nextValue(value: number) {
        const sma = this.sma.nextValue(value);
        this.buffer.push(value);
        this.fill++;
        if (this.fill < this.period + this.shift) {
            return;
        }
        const arr = this.buffer.toArray();
        const shiftedPrice = arr[0];
        const dpo = shiftedPrice - sma;
        this.nextValue = (value: number) => {
            const sma = this.sma.nextValue(value);
            this.buffer.push(value);
            const arr = this.buffer.toArray();
            const shiftedPrice = arr[0];
            return shiftedPrice - sma;
        };
        return dpo;
    }

    /**
     * Calculates DPO for the current (not closed) bar without changing the internal state
     * @param value Input value (e.g., close price)
     */
    momentValue(value: number) {
        const arr = this.buffer.toArray().slice();
        arr.push(value);
        if (arr.length > this.shift + 1) arr.shift();
        if (arr.length < this.shift + 1) return;
        const sma = this.sma.momentValue(value);
        const shiftedPrice = arr[0];
        return shiftedPrice - sma;
    }
} 