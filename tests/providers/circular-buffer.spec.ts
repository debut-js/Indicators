import { CircularBuffer } from '../../src/providers/circular-buffer';

describe('Circular buffer', () => {
    it('loaded reflects count before and after wrap', () => {
        const b = new CircularBuffer(3);
        expect(b.loaded).toBe(0);
        b.push(1);
        expect(b.loaded).toBe(1);
        b.push(2);
        expect(b.loaded).toBe(2);
        b.push(3);
        expect(b.loaded).toBe(3);
        b.push(4);
        expect(b.loaded).toBe(3);
    });

    it('for each', () => {
        const buffer = new CircularBuffer(6);
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        const result = [8, 9, 10, 11, 12, 13];

        data.forEach((item) => buffer.push(item));

        buffer.forEach((item, idx) => {
            // console.log(item, idx);
            expect(item).toEqual(result[idx]);
        });
    });
});
