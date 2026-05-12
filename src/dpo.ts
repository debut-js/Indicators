import { SMA } from './sma';
import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Detrended Price Oscillator (DPO)
 *
 * DPO = Price - SMA(shifted)
 *
 * The SMA is shifted back by (period / 2 + 1) bars.
 */
export class DPO  implements StatefulIndicator<GenericIndicatorState> {
    private sma: SMA;
    private buffer: CircularBuffer<number>;
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
    nextValue(value: number): number | undefined {
        const sma = this.sma.nextValue(value);
        this.buffer.push(value);
        this.fill++;
        if (this.fill < this.period + this.shift) {
            return;
        }
        const arr = this.buffer.toArray();
        const shiftedPrice = arr[0];
        if (shiftedPrice === undefined || sma === undefined) return;

        const dpo = shiftedPrice - sma;
        this.nextValue = (value: number): number | undefined => {
            const sma = this.sma.nextValue(value);
            this.buffer.push(value);
            const arr = this.buffer.toArray();
            const shiftedPrice = arr[0];
            if (shiftedPrice === undefined || sma === undefined) return;

            return shiftedPrice - sma;
        };
        return dpo;
    }

    /**
     * Calculates DPO for the current (not closed) bar without changing the internal state
     * @param value Input value (e.g., close price)
     */
    momentValue(value: number): number | undefined {
        const arr = this.buffer.toArray().slice();
        arr.push(value);
        if (arr.length > this.shift + 1) arr.shift();
        if (arr.length < this.shift + 1) return;
        const sma = this.sma.momentValue(value);
        const shiftedPrice = arr[0];
        if (shiftedPrice === undefined || sma === undefined) return;

        return shiftedPrice - sma;
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
        delete (this as { nextValue?: DPO['nextValue'] }).nextValue;
        if (this.fill < this.period + this.shift) return;

        this.nextValue = (value: number): number | undefined => {
            const sma = this.sma.nextValue(value);
            this.buffer.push(value);
            const arr = this.buffer.toArray();
            const shiftedPrice = arr[0];
            if (shiftedPrice === undefined || sma === undefined) return;

            return shiftedPrice - sma;
        };
    }
}
