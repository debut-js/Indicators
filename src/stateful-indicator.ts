export interface StatefulIndicator<TState> {
    dumpState(): TState;
    restoreState(state: TState): this;
}

export interface GenericIndicatorState {
    fields: Record<string, GenericStateValue>;
}

export type GenericStateValue =
    | null
    | string
    | number
    | boolean
    | { type: 'undefined' }
    | { type: 'number'; value: 'NaN' | 'Infinity' | '-Infinity' }
    | { type: 'array'; items: GenericStateValue[] }
    | { type: 'object'; fields: Record<string, GenericStateValue> }
    | { type: 'stateful'; state: unknown };

export type OptionalNumberState = { hasValue: false } | { hasValue: true; value: number };

export function dumpOptionalNumber(value: number | undefined): OptionalNumberState {
    return value === undefined ? { hasValue: false } : { hasValue: true, value };
}

export function restoreOptionalNumber(state: OptionalNumberState): number | undefined {
    return state.hasValue ? state.value : undefined;
}

export function dumpObjectState(target: object): GenericIndicatorState {
    return {
        fields: dumpFields(target),
    };
}

export function restoreObjectState<T extends object>(target: T, state: GenericIndicatorState): T {
    clearOwnFunctions(target);
    restoreFields(target, state.fields);

    return target;
}

function dumpValue(value: unknown): GenericStateValue {
    if (value === undefined) return { type: 'undefined' };
    if (typeof value === 'number') {
        if (Number.isNaN(value)) return { type: 'number', value: 'NaN' };
        if (value === Infinity) return { type: 'number', value: 'Infinity' };
        if (value === -Infinity) return { type: 'number', value: '-Infinity' };
        return value;
    }

    if (value === null) {
        return null;
    }

    if (typeof value === 'string' || typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'function') {
        return { type: 'undefined' };
    }

    if (isStatefulIndicator(value)) {
        return { type: 'stateful', state: value.dumpState() };
    }

    if (Array.isArray(value)) {
        const items: GenericStateValue[] = [];

        for (let i = 0; i < value.length; i++) {
            items.push(dumpValue(value[i]));
        }

        return { type: 'array', items };
    }

    if (typeof value === 'object' && value !== null) {
        return { type: 'object', fields: dumpFields(value) };
    }

    return { type: 'undefined' };
}

function restoreValue(current: unknown, value: GenericStateValue): unknown {
    if (isEncodedUndefined(value)) return undefined;
    if (!isEncodedContainer(value)) return value;

    if (value.type === 'number') {
        switch (value.value) {
            case 'NaN':
                return NaN;
            case 'Infinity':
                return Infinity;
            case '-Infinity':
                return -Infinity;
        }
    }

    if (value.type === 'array') {
        const arr: unknown[] = Array.isArray(current) ? current : [];
        arr.length = value.items.length;

        for (let i = 0; i < value.items.length; i++) {
            arr[i] = restoreValue(arr[i], value.items[i]);
        }

        return arr;
    }

    if (value.type === 'stateful') {
        if (!isStatefulIndicator(current)) {
            throw new Error('Cannot restore stateful field into non-stateful target');
        }

        return current.restoreState(value.state);
    }

    const target: object = current && typeof current === 'object' ? current : {};
    clearOwnFunctions(target);
    restoreFields(target, value.fields);

    return target;
}

function dumpFields(target: object): Record<string, GenericStateValue> {
    const fields: Record<string, GenericStateValue> = {};
    const source: Record<string, unknown> = target as Record<string, unknown>;

    Object.keys(source).forEach((key: string): void => {
        fields[key] = dumpValue(source[key]);
    });

    return fields;
}

function restoreFields(target: object, fields: Record<string, GenericStateValue>): void {
    const targetRecord: Record<string, unknown> = target as Record<string, unknown>;

    Object.keys(fields).forEach((key: string): void => {
        targetRecord[key] = restoreValue(targetRecord[key], fields[key]);
    });
}

function clearOwnFunctions(target: object): void {
    const targetRecord: Record<string, unknown> = target as Record<string, unknown>;

    Object.keys(targetRecord).forEach((key: string): void => {
        if (typeof targetRecord[key] === 'function') {
            delete targetRecord[key];
        }
    });
}

function isStatefulIndicator(value: unknown): value is StatefulIndicator<unknown> {
    if (!value || typeof value !== 'object') return false;

    const candidate = value as { dumpState?: unknown; restoreState?: unknown };

    return typeof candidate.dumpState === 'function' && typeof candidate.restoreState === 'function';
}

function isEncodedUndefined(value: GenericStateValue): value is { type: 'undefined' } {
    return typeof value === 'object' && value !== null && (value as { type?: unknown }).type === 'undefined';
}

function isEncodedContainer(
    value: GenericStateValue,
): value is
    | { type: 'number'; value: 'NaN' | 'Infinity' | '-Infinity' }
    | { type: 'array'; items: GenericStateValue[] }
    | { type: 'object'; fields: Record<string, GenericStateValue> }
    | { type: 'stateful'; state: unknown } {
    return typeof value === 'object' && value !== null && 'type' in value;
}
