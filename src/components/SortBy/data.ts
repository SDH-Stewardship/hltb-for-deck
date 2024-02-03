import { ServerAPI } from 'decky-frontend-lib';
import { getHltbData, needCacheUpdate } from '../../hooks/useHltb';
import { Mobx } from '../../module';
import { HLTBStats } from '../../hooks/GameInfoData';
import { getMemCache } from '../../hooks/Cache';

export const cacheHltbDataProgress = Mobx.makeAutoObservable({
    total: 0,
    current: 0,

    next() {
        this.current += 1;
    },

    reset(total: number = 0) {
        this.total = total;
        this.current = 0;
    },
});

export const cacheHltbData = async (
    serverAPI: ServerAPI,
    allApps: Array<any>
) => {
    const apps = allApps.filter((app) => {
        const cache = getMemCache<HLTBStats>(app.appid.toString());
        return !cache || needCacheUpdate(cache.lastUpdatedAt, 360);
    });

    if (apps.length === 0) return;

    cacheHltbDataProgress.reset(apps.length);

    for (const app of apps) {
        if (cacheHltbDataProgress.total === 0) {
            return;
        }

        cacheHltbDataProgress.next();

        await getHltbData(app.appid, app.display_name, 360, serverAPI);
    }

    cacheHltbDataProgress.reset();
};

export const wrapAppOverviews = (eSortBy: number, apps: Array<any>) => {
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

    return apps.map((app: object) => new Proxy(app, handler));
};
