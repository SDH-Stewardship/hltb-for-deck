import { findModule, findModuleChild } from 'decky-frontend-lib';
import * as MOBX from 'mobx';

export const Mobx: typeof MOBX = findModule(
    (m) => typeof m === 'object' && '$mobx' in m
);

export const MobxReact = findModule(
    (m) => typeof m === 'object' && 'MobXProviderContext' in m
);

export const useSortBy = findModuleChild((m) => {
    if (typeof m !== 'object') return;

    for (const prop in m) {
        if (
            m[prop]?.toString().includes('Library_SortCollectionBy') &&
            m[prop].toString().includes('AppGridDisplaySettings')
        ) {
            return m[prop];
        }
    }

    return;
});
