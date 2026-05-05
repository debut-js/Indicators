import { CircularBuffer } from './circular-buffer';
export class StandardDeviation {
    private values: CircularBuffer;

    constructor(private period: number) {
        this.values = new CircularBuffer(period);
    }

    nextValue(value: number, mean?: number) {
        this.values.push(value);

        return Math.sqrt(this.values.toArray().reduce((acc, item) => acc + (item - mean) ** 2, 0) / this.period);
    }

    momentValue(value: number, mean?: number) {
        // Sum squared deviations over the hypothetical post-push window
        // without mutating the buffer: skip the would-be-evicted slot
        // (when filled) and append `value` as the newest entry.
        const startOffset = this.values.filled ? 1 : 0;
        const realCount = this.values.loaded - startOffset;

        let sumSq = (value - mean) ** 2;
        for (let i = 0; i < realCount; i++) {
            const v = this.values.at(i + startOffset) as number;
            sumSq += (v - mean) ** 2;
        }

        return Math.sqrt(sumSq / this.period);
    }
}
