import { ForceIndex } from '../../src/force-index';

describe('ForceIndex', () => {
    it('is undefined on the first close', () => {
        const f = new ForceIndex();
        expect(f.nextValue(100, 1000)).toBeUndefined();
    });

    it('equals (close - prevClose) * volume', () => {
        const f = new ForceIndex();
        f.nextValue(100, 1000);
        expect(f.nextValue(102, 500)).toBe(2 * 500);
        expect(f.nextValue(99, 200)).toBe(-3 * 200);
    });

    it('momentValue matches the formula without advancing state', () => {
        const f = new ForceIndex();
        f.nextValue(10, 100);
        f.nextValue(12, 200);
        const m = f.momentValue(11, 300);
        expect(m).toBe((11 - 12) * 300);
    });
});
