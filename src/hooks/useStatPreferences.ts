import { useEffect, useState } from 'react';
import { getStatPreferences } from './Cache';

export type StatPreferences = {
    showMain: boolean;
    showMainPlus: boolean;
    showComplete: boolean;
    showAllStyles: boolean;
    sortByStat: 'allStylesStat' | 'mainStat' | 'mainPlusStat' | 'completeStat';
};
export const useStatPreferences = () => {
    const [statPrefs, setStatPrefs] = useState<StatPreferences>({
        showMain: true,
        showMainPlus: true,
        showComplete: true,
        showAllStyles: true,
        sortByStat: 'allStylesStat',
    });
    useEffect(() => {
        const getData = async () => {
            let prefs = await getStatPreferences();
            if (prefs === null) prefs = statPrefs;
            setStatPrefs(prefs);
        };
        getData();
    }, []);

    return statPrefs;
};
