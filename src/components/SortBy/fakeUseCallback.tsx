import { ServerAPI, showContextMenu } from 'decky-frontend-lib';
import { useCallback } from 'react';
import SortByMenu from './SortByMenu';

export const fakeUseCallback =
    (
        realUseCallback: typeof useCallback,
        setSortBy: (sortBy: number) => void,
        serverAPI: ServerAPI
    ) =>
    (fn: () => unknown, deps: unknown[]) => {
        if (!fn.toString().includes('Library_SortCollectionBy')) {
            return realUseCallback(fn, deps);
        }

        return realUseCallback(
            () =>
                showContextMenu(
                    <SortByMenu setSortBy={setSortBy} serverAPI={serverAPI} />
                ),
            [setSortBy, serverAPI]
        );
    };
