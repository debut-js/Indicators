import { MaxProvider } from './providers/max-value';
import { MinProvider } from './providers/min-value';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Donchian channels were developed by Richard Donchian, a pioneer of mechanical trend following systems.
 * The two outer bands are plotted as the highest high and lowest low for a set period,
 * originally 20 days, with the optional middle band calculated as the average of the two.
 */
export class DC  implements StatefulIndicator<GenericIndicatorState> {
    private maxProvider: MaxProvider;
    private minProvider: MinProvider;

    constructor(period = 20) {
        this.maxProvider = new MaxProvider(period);
        this.minProvider = new MinProvider(period);
    }

    nextValue(high: number, low: number) {
        const upper = this.maxProvider.nextValue(high);
        const lower = this.minProvider.nextValue(low);

        return { upper, middle: (upper + lower) / 2, lower };
    }

    momentValue(high: number, low: number) {
        const upper = this.maxProvider.momentValue(high);
        const lower = this.minProvider.momentValue(low);

        return { upper, middle: (upper + lower) / 2, lower };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
