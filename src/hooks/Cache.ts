import localforage from 'localforage';
import { HLTBStyle } from './useStyle';
import { HLTBStats } from './GameInfoData';
import { StatPreferences } from './useStatPreferences';

const database = 'hltb-for-deck';
export const styleKey = 'hltb-style';
export const hideDetailsKey = 'hltb-hide-details';
export const statPreferencesKey = 'hltb-stat-preferences';

localforage.config({
    name: database,
});

const memCache = new Map<string, unknown>();

export async function updateCache<T>(key: string, value: T) {
    memCache.set(key, value);
    await localforage.setItem(key, value);
}

export function getMemCache<T>(key: string): T | undefined {
    return memCache.get(key) as T;
}

export async function getCache<T>(key: string): Promise<T | null> {
    const value = await localforage.getItem<T>(key);
    memCache.set(key, value);
    return value;
}

export async function setShowHide(appId: string) {
    const stats = await localforage.getItem<HLTBStats>(appId);
    if (stats) {
        stats.showStats = !stats.showStats;
        await localforage.setItem(appId, stats);
    }
}

export async function getStyle(): Promise<HLTBStyle> {
    const hltbStyle = await localforage.getItem<HLTBStyle>(styleKey);
    return hltbStyle === null ? 'default' : hltbStyle;
}

export async function getPreference(): Promise<boolean> {
    const hideViewDetails = await localforage.getItem<boolean>(hideDetailsKey);
    return hideViewDetails === null ? false : hideViewDetails;
}

export async function getStatPreferences(): Promise<StatPreferences | null> {
    const preferences = await localforage.getItem<StatPreferences>(
        statPreferencesKey
    );
    return preferences;
}

export const clearCache = () => {
    const style = getStyle();
    localforage.clear();
    updateCache(styleKey, style);
};
