import { Sampler } from '../../src/providers/sampler';
import { SMA } from '../../src/sma';

describe('Sampler', () => {
    const PERIOD = 6;

    it('SMA samples', () => {
        let data = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
            30,
        ];
        data = data.concat(data.reverse());

        const sampler = new Sampler(SMA, 3);
        const sma1 = new SMA(PERIOD);
        const sma2 = new SMA(PERIOD);
        const sma3 = new SMA(PERIOD);

        sampler.create(PERIOD);

        data.forEach((item) => {
            const sample1 = sma1.nextValue(item);
            const sample2 = sample1 === undefined ? undefined : sma2.nextValue(sample1);
            const sample3 = sample2 === undefined ? undefined : sma3.nextValue(sample2);
            const samplerValue = sampler.nextValue(item);

            if (sample3 !== undefined && samplerValue !== undefined) {
                expect(samplerValue).toBe(sample3);
            }
        });
    });
});
