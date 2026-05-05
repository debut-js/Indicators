import { CircularBuffer } from './circular-buffer';

export class Extremums extends CircularBuffer {
    private comparator: Function;
    private prevIx: number;

    constructor(public period = 100, private mode: 'max' | 'min') {
        super(period);
        this.comparator = mode === 'max' ? this.maxComporator : this.mminComporator;
    }

    nextValue(value: number) {
        this.push(value);

        return this.getExtremum();
    }

    momentValue(value: number) {
        // `getExtremum` walks `this.buffer` directly with neighbour
        // lookups (idx ± 1), so a peek-based hypothetical scan would
        // require duplicating that traversal. We deliberately keep the
        // push/pushback pattern here despite the deprecation marker —
        // it's the only safe way to share `getExtremum`'s logic without
        // forking the algorithm. Note: `getExtremum` also mutates
        // `this.prevIx`, which pushback does NOT revert (long-standing
        // behaviour, preserved here).
        const rm = this.push(value);
        const extr = this.getExtremum();
        this.pushback(rm);

        return extr;
    }

    private maxComporator(a: number, b: number) {
        if (a > b) {
            return true;
        }

        return false;
    }

    private mminComporator(a: number, b: number) {
        if (a < b) {
            return true;
        }

        return false;
    }

    public getExtremum(shallow?: boolean): number {
        let extremumIdx = (this.length + this.pointer - 2) % this.length;
        let extremum: number = this.mode === 'max' ? -Infinity : Infinity;

        if (!this.filled) {
            return 0;
        }

        while (extremumIdx !== this.pointer) {
            const before = this.buffer[(this.length + extremumIdx - 1) % this.length];
            const after = this.buffer[(this.length + extremumIdx + 1) % this.length];
            const foundExtremum = this.buffer[extremumIdx];

            if (
                this.comparator(foundExtremum, extremum) &&
                this.comparator(foundExtremum, before) &&
                this.comparator(foundExtremum, after)
            ) {
                extremum = foundExtremum;

                if (this.prevIx === extremumIdx) {
                    return null;
                }

                this.prevIx = extremumIdx;

                if (shallow) {
                    return extremum;
                }
            }

            extremumIdx = (this.length + extremumIdx - 1) % this.length;
        }

        if (isFinite(extremum)) {
            return extremum;
        }

        this.prevIx = null;

        return null;
    }
}
