import { Fractal } from '../../src/fractal';

describe('Fractal', () => {
    it('detects a swing high (fractal up)', () => {
        const f = new Fractal(2, 2);
        const highs = [1, 1, 10, 1, 1];
        const lows = [0, 0, 0, 0, 0];
        let up: number | undefined;
        for (let i = 0; i < highs.length; i++) {
            const r = f.nextValue(highs[i], lows[i]);
            if (r && r.up !== undefined) up = r.up;
        }
        expect(up).toBe(10);
    });

    it('with full window, momentValue returns a defined structure', () => {
        const f = new Fractal(1, 1);
        f.nextValue(1, 5);
        f.nextValue(3, 3);
        f.nextValue(2, 2);
        f.nextValue(1, 1);
        const m = f.momentValue(1, 1) as { up?: number; down?: number };
        expect(m).toBeDefined();
        expect('up' in m).toBe(true);
        expect('down' in m).toBe(true);
    });
});
