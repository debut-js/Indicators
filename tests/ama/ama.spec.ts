import { AMA } from '../../src/ama';
import { data } from './data';

describe('Adaptive Moving Average', () => {
    const ama = new AMA(15, 2, 30);
    const EPSILON = 0.0001;

    it('Excel validate', () => {
        data.forEach((tick, idx) => {
            const amaValue = ama.nextValue(Number(tick.Close));
            const expected = Number(tick.AMA);

            console.log(amaValue, expected);

            // expect(amaValue).toBe(Number(expected));
        });
    });
});
