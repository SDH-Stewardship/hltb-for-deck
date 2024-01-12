import { ServerAPI } from 'decky-frontend-lib';
import { StatPreferences } from '../../hooks/useStatPreferences';
import { getHltbData } from '../../hooks/useHltb';
import { useEffect } from 'react';
import { Mobx } from '../../module';

const { allAppsCollection } = (window as any).collectionStore;

const freezeProperty = (obj: any, property: string) => {
    if (!Mobx._getAdministration(obj).values_.has(property)) {
        Mobx.makeObservable(obj, { [property]: Mobx.observable });
    }

    return Mobx.intercept(obj, property, () => null);
};

const cache = new Map<
    number,
    {
        playtime: number;
        hltb: number;
        dispose?: () => void;
    }
>();

export const patchAppDetailsProgress = Mobx.makeAutoObservable({
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

export const patchAppDetails = async (
    sortByStat: StatPreferences['sortByStat'],
    serverAPI: ServerAPI
) => {
    patchAppDetailsProgress.reset(allAppsCollection.allApps.length);

    for (const app of allAppsCollection.allApps) {
        patchAppDetailsProgress.next();

        const data = await getHltbData(
            app.appid,
            app.display_name,
            360,
            serverAPI
        );

        const details = cache.get(app.appid);
        details?.dispose?.();

        cache.set(app.appid, {
            playtime: details?.playtime ?? app.minutes_playtime_forever,
            hltb:
                data[sortByStat] === '--'
                    ? 0
                    : parseFloat(data[sortByStat]) * 60,
        });
    }

    patchAppDetailsProgress.reset();

    setTimeout(() => {
        for (const app of allAppsCollection.allApps) {
            const details = cache.get(app.appid) ?? {
                playtime: app.minutes_playtime_forever,
                hltb: 0,
            };

            app.minutes_playtime_forever = details.hltb;

            cache.set(app.appid, {
                ...details,
                dispose: freezeProperty(app, 'minutes_playtime_forever'),
            });
        }
    }, 100);
};

export const resetAppDetails = () => {
    cache.forEach((details, appId) => {
        details.dispose?.();
        allAppsCollection.apps.get(appId).minutes_playtime_forever =
            details.playtime;
    });
    cache.clear();
};

export const useResetOnUnmount = () =>
    useEffect(() => () => resetAppDetails(), []);
