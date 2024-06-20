import { ServerAPI } from 'decky-frontend-lib';
import { create } from 'zustand';

import { getHltbData, needCacheUpdate } from '../../hooks/useHltb';
import { HLTBStats } from '../../hooks/GameInfoData';
import { getMemCache } from '../../hooks/Cache';

type State = {
    queue: Array<any>;
    locked: boolean;

    total: number;
    current: number;

    put: (app: any) => void;

    take: () => any;

    run: (serverAPI: ServerAPI) => void;

    abort: () => void;
};

export const cacheQueue = create<State>()((set, get) => ({
    queue: [],
    locked: false,

    total: 0,
    current: 0,

    put: (app: any) =>
        set((state) =>
            !state.queue.includes(app) &&
            needCacheUpdate(
                getMemCache<HLTBStats>(app.appid.toString())?.lastUpdatedAt,
                720 // One month
            )
                ? { queue: [...state.queue, app], total: state.total + 1 }
                : {}
        ),

    take: () => {
        const app: any = get().queue[0];

        set((state) =>
            state.queue.length === 1
                ? { queue: [], current: 0, total: 0 }
                : {
                      queue: state.queue.slice(1),
                      current: state.current + 1,
                  }
        );

        return app;
    },

    run: async (serverAPI: ServerAPI) => {
        if (get().locked) return;

        set({ locked: true });

        while (get().queue.length) {
            const app = get().take();

            await getHltbData(app.appid, app.display_name, 360, serverAPI);
        }

        set(() => ({ locked: false }));
    },

    abort: () => set({ queue: [], locked: false, total: 0, current: 0 }),
}));

export const wrapCollection = (eSortBy: number, collection: any) => {
    const stat =
        eSortBy === 41
            ? 'mainStat'
            : eSortBy === 42
            ? 'mainPlusStat'
            : eSortBy === 43
            ? 'completeStat'
            : 'allStylesStat';

    const handler = {
        get(target: any, prop: string, receiver: unknown) {
            if (prop !== 'minutes_playtime_forever') {
                return Reflect.get(target, prop, receiver);
            }

            const data = getMemCache<HLTBStats>(target.appid.toString());
            return !data || data?.[stat] === '--'
                ? 0
                : parseFloat(data[stat]) * 60;
        },
    };

    return new Proxy(collection, {
        get(target: any, prop: string, receiver: unknown) {
            const value = Reflect.get(target, prop, receiver);

            if (prop !== 'visibleApps') {
                return value;
            }

            return value.map((app: object) => new Proxy(app, handler));
        },
    });
};
