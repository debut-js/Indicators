import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Chande Momentum Oscillator (CMO)
 *
 * CMO = 100 * (Sum of Gains - Sum of Losses) / (Sum of Gains + Sum of Losses)
 *
 * - Gains: sum of positive changes over period
 * - Losses: sum of absolute value of negative changes over period
 */
export class CMO  implements StatefulIndicator<GenericIndicatorState> {
    private buffer: CircularBuffer;
    private fill = 0;

    /**
     * @param period Period for calculation (default: 14)
     */
    constructor(private period = 14) {
        this.buffer = new CircularBuffer(period + 1);
    }

    /**
     * Adds a new value and returns the CMO
     * @param value Input value (e.g., close price)
     */
    nextValue(value: number) {
        this.buffer.push(value);
        this.fill++;
        if (this.fill < this.period + 1) {
            return;
        }
        const arr = this.buffer.toArray().slice(-this.period - 1);
        let gains = 0;
        let losses = 0;
        for (let i = 1; i < arr.length; i++) {
            const diff = arr[i] - arr[i - 1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }
        const denom = gains + losses;
        if (denom === 0) return 0;
        const cmo = 100 * (gains - losses) / denom;
        this.nextValue = (value: number) => {
            this.buffer.push(value);
            const arr = this.buffer.toArray().slice(-this.period - 1);
            let gains = 0;
            let losses = 0;
            for (let i = 1; i < arr.length; i++) {
                const diff = arr[i] - arr[i - 1];
                if (diff > 0) gains += diff;
                else losses -= diff;
            }
            const denom = gains + losses;
            if (denom === 0) return 0;
            return 100 * (gains - losses) / denom;
        };
        return cmo;
    }

    /**
     * Calculates CMO for the current (not closed) bar without changing the internal state
     * @param value Input value (e.g., close price)
     */
    momentValue(value: number) {
        const arr = this.buffer.toArray().slice(-this.period);
        arr.push(value);
        if (arr.length < 2) return;
        let gains = 0;
        let losses = 0;
        for (let i = 1; i < arr.length; i++) {
            const diff = arr[i] - arr[i - 1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }
        const denom = gains + losses;
        if (denom === 0) return 0;
        return 100 * (gains - losses) / denom;
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
        if (this.fill < this.period + 1) return;

        this.nextValue = (value: number) => {
            this.buffer.push(value);
            const arr = this.buffer.toArray().slice(-this.period - 1);
            let gains = 0;
            let losses = 0;
            for (let i = 1; i < arr.length; i++) {
                const diff = arr[i] - arr[i - 1];
                if (diff > 0) gains += diff;
                else losses -= diff;
            }
            const denom = gains + losses;
            if (denom === 0) return 0;
            return 100 * (gains - losses) / denom;
        };
    }
}
