/**
 * Circular buffers (also known as ring buffers) are fixed-size buffers that work as if the memory is contiguous & circular in nature.
 * As memory is generated and consumed, data does not need to be reshuffled – rather, the head/tail pointers are adjusted.
 * When data is added, the head pointer advances. When data is consumed, the tail pointer advances.
 * If you reach the end of the buffer, the pointers simply wrap around to the beginning.
 */
export class CircularBuffer<T = number> {
    public filled = false;
    protected pointer = 0;
    protected buffer: Array<T>;
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
    public push(item: T) {
        const overwrited = this.buffer[this.pointer];

        this.buffer[this.pointer] = item;
        this.iteratorNext();

        return overwrited;
    }

    /**
     * Replace last added item in buffer (reversal push). May be used for revert push removed item.
     * @deprecated use peek instead
     */
    public pushback(item: T) {
        this.iteratorPrev();
        const overwrited = this.buffer[this.pointer];
        this.buffer[this.pointer] = item;

        return overwrited;
    }

    /**
     * Get item for replacing, does not modify anything
     */
    public peek() {
        return this.buffer[this.pointer];
    }

    /**
     * Array like forEach loop
     */
    public forEach(callback: (value: T, index?: number) => void) {
        let idx = this.pointer;
        let virtualIdx = 0;

        while (virtualIdx !== this.length) {
            callback(this.buffer[idx], virtualIdx);
            idx = (this.length + idx + 1) % this.length;
            virtualIdx++;
        }
    }

    /**
     * Array like forEach loop, but from last to first (reversal forEach)
     */
    forEachRight(callback: (value: T, index?: number) => void) {
        let idx = (this.length + this.pointer - 1) % this.length;
        let virtualIdx = this.length - 1;

        while (virtualIdx !== this.length) {
            callback(this.buffer[idx], virtualIdx);
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
    public fill(item: T) {
        this.buffer.fill(item);
        this.filled = true;
    }

    /**
     * Get array from buffer
     */
    public toArray() {
        return this.buffer;
    }

    /**
     * Move iterator to next position
     */
    private iteratorNext() {
        this.pointer++;

        if (this.pointer > this.maxIndex) {
            this.pointer = 0;
            this.filled = true;
        }
    }

    /**
     * Move iterator to prev position
     */
    private iteratorPrev() {
        this.pointer--;

        if (this.pointer < 0) {
            this.pointer = this.maxIndex;
        }
    }
}
