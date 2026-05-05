import { CircularBuffer } from './providers/circular-buffer';

/**
 * Momentum
 *
 *   Mom = price - price[length]
 *
 * Returns `undefined` until `length` past values have been observed.
 */
export class Momentum {
    private buffer: CircularBuffer;

    constructor(private period = 10) {
        // Need length+1 slots so that after `length` pushes we still
        // have access to the value from `length` bars ago.
        this.buffer = new CircularBuffer(period + 1);
    }

    nextValue(value: number) {
        this.buffer.push(value);
        if (!this.buffer.filled) return;
        // Oldest in window = price[length] (filled means we hold length+1 values).
        return value - (this.buffer.at(0) as number);
    }

    momentValue(value: number) {
        // Buffer holds period+1 slots. After a hypothetical push,
        // `value` becomes the newest and the value `period` bars back
        // is whichever slot would be left at index 0 in the new layout.
        if (!this.buffer.filled) {
            if (this.buffer.loaded !== this.period) {
                return;
            }
            // Push would fill the buffer with no eviction: the oldest
            // stays at index 0, so `period bars ago` == at(0).
            return value - (this.buffer.at(0) as number);
        }
        // Buffer is full: hypothetical push evicts at(0), so the new
        // oldest (= `period bars ago`) is the current at(1).
        return value - (this.buffer.at(1) as number);
    }
}
