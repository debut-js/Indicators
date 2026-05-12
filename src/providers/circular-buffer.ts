import { StatefulIndicator } from '../stateful-indicator';

export type CircularBufferSlotState<T> = { hasValue: false } | { hasValue: true; value: T };
export type RestorableCircularBufferSlotState<T> = CircularBufferSlotState<T> | null;

export interface CircularBufferState<T = number> {
    length: number;
    filled: boolean;
    pointer: number;
    buffer: RestorableCircularBufferSlotState<T>[];
}

/**
 * Circular buffers (also known as ring buffers) are fixed-size buffers that work as if the memory is contiguous & circular in nature.
 * As memory is generated and consumed, data does not need to be reshuffled – rather, the head/tail pointers are adjusted.
 * When data is added, the head pointer advances. When data is consumed, the tail pointer advances.
 * If you reach the end of the buffer, the pointers simply wrap around to the beginning.
 */
export class CircularBuffer<T = number> implements StatefulIndicator<CircularBufferState<T>> {
    public filled = false;
    protected pointer = 0;
    protected buffer: Array<T | undefined>;
    protected maxIndex: number;

    /**
     * Constructor
     * @param length fixed buffer length
     */
    constructor(public length: number) {
        this.buffer = new Array(length);
        this.maxIndex = length - 1;
    }

    /**
     * Push item to buffer, when buffer length is overflow, push will rewrite oldest item
     */
    public push(item: T): T {
        const overwrited = this.buffer[this.pointer];

        this.buffer[this.pointer] = item;
        this.iteratorNext();

        return overwrited as T;
    }

    /**
     * Replace last added item in buffer (reversal push). May be used for revert push removed item.
     * @deprecated use peek instead
     */
    public pushback(item: T): T {
        this.iteratorPrev();
        const overwrited = this.buffer[this.pointer];
        this.buffer[this.pointer] = item;

        return overwrited as T;
    }

    /**
     * Get item for replacing, does not modify anything
     */
    public peek(): T {
        return this.buffer[this.pointer] as T;
    }

    /**
     * Native `Array.prototype.at`-style indexing. Negative offsets count
     * back from the most recent push: `at(-1)` returns the value pushed
     * last, `at(-2)` the one before it, etc. Positive offsets count
     * from the oldest entry currently stored: `at(0)` is the oldest,
     * `at(loaded - 1)` the newest. Returns `undefined` when the
     * requested slot hasn't been written yet (warmup).
     *
     * Useful for pipelines that pull "previous-bar" values (e.g. SMA
     * cross detection) without manually walking `toArray()` and
     * tracking how the ring wrapped.
     */
    public at(offset: number): T | undefined {
        const len = this.loaded;
        if (len === 0) return undefined;
        const virtIdx = offset < 0 ? len + offset : offset;
        if (virtIdx < 0 || virtIdx >= len) return undefined;
        // For an unfilled buffer items live in `[0, pointer)` in
        // insertion order, so the oldest is at index 0. Once filled,
        // the oldest sits at `pointer` (the next slot to be
        // overwritten) and we wrap modulo length from there.
        const start = this.filled ? this.pointer : 0;
        return this.buffer[(start + virtIdx) % this.length];
    }

    /**
     * Array like forEach loop
     */
    public forEach(callback: (value: T, index: number) => void): void {
        let idx = this.pointer;
        let virtualIdx = 0;

        while (virtualIdx !== this.length) {
            callback(this.buffer[idx] as T, virtualIdx);
            idx = (this.length + idx + 1) % this.length;
            virtualIdx++;
        }
    }

    /**
     * Array like forEach loop, but from last to first (reversal forEach)
     */
    forEachRight(callback: (value: T, index: number) => void): void {
        let idx = (this.length + this.pointer - 1) % this.length;
        let virtualIdx = this.length - 1;

        while (virtualIdx !== this.length) {
            callback(this.buffer[idx] as T, virtualIdx);
            idx = (this.length + idx - 1) % this.length;
            virtualIdx--;
        }
    }

    /**
     * Number of values currently stored (before wrap: same as write position; after fill: buffer length).
     */
    public get loaded(): number {
        return this.filled ? this.length : this.pointer;
    }

    /**
     * Fill buffer
     */
    public fill(item: T): void {
        this.buffer.fill(item);
        this.filled = true;
    }

    /**
     * Get array from buffer
     */
    public toArray(): T[] {
        return this.buffer as T[];
    }

    public dumpState(): CircularBufferState<T> {
        const buffer: CircularBufferSlotState<T>[] = [];

        for (let i = 0; i < this.buffer.length; i++) {
            const value = this.buffer[i];
            buffer.push(value === undefined ? { hasValue: false } : { hasValue: true, value });
        }

        return {
            length: this.length,
            filled: this.filled,
            pointer: this.pointer,
            buffer,
        };
    }

    public restoreState(state: CircularBufferState<T>): this {
        if (state.length !== this.length) {
            throw new Error(`CircularBuffer length mismatch: expected ${this.length}, got ${state.length}`);
        }

        this.filled = state.filled;
        this.pointer = state.pointer;
        this.maxIndex = this.length - 1;
        this.buffer = state.buffer.map((slot: RestorableCircularBufferSlotState<T>): T | undefined =>
            slot && slot.hasValue ? slot.value : undefined,
        );

        return this;
    }

    /**
     * Move iterator to next position
     */
    private iteratorNext(): void {
        this.pointer++;

        if (this.pointer > this.maxIndex) {
            this.pointer = 0;
            this.filled = true;
        }
    }

    /**
     * Move iterator to prev position
     */
    private iteratorPrev(): void {
        this.pointer--;

        if (this.pointer < 0) {
            this.pointer = this.maxIndex;
        }
    }
}
