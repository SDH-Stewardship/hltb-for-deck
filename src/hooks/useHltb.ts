import { fetchNoCors } from '@decky/api';
import { get } from 'fast-levenshtein';
import { useState, useEffect } from 'react';
import { normalize } from '../utils';
import { GameStatsData, HLTBStats, SearchResults } from './GameInfoData';
import { getCache, updateCache } from './Cache';

// update cache after 12 hours
function needCacheUpdate(lastUpdatedAt: Date) {
    const now = new Date();
    const durationMs = Math.abs(lastUpdatedAt.getTime() - now.getTime());

    const hoursBetweenDates = durationMs / (60 * 60 * 1000);
    return hoursBetweenDates > 12;
}

// NOTE: Close reproduction of https://github.com/ScrappyCocco/HowLongToBeat-PythonAPI/pull/26
async function fetchApiKey() {
    try {
        const url = 'https://howlongtobeat.com';
        const response = await fetchNoCors(url);

        if (response.status === 200) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const scripts = doc.querySelectorAll('script');

            for (const script of scripts) {
                if (script.src.includes('_app-')) {
                    const scriptUrl = url + new URL(script.src).pathname;
                    const scriptResponse = await fetchNoCors(scriptUrl);

                    if (scriptResponse.status === 200) {
                        const scriptText = await scriptResponse.text();
                        const pattern =
                            /"\/api\/search\/".concat\("([a-zA-Z0-9]+)"\)/;
                        const matches = scriptText.match(pattern);

                        if (matches && matches[1]) {
                            return matches[1];
                        }
                    }
                }
            }

            console.error('HLTB - failed to get API key!');
        } else {
            console.error(`HLTB - ${response}`);
        }
    } catch (error) {
        console.error(error);
    }

    return null;
}

async function fetchSearchResultsWithKey(data: object, apiKey: string) {
    return fetchNoCors(`https://howlongtobeat.com/api/search/${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Origin: 'https://howlongtobeat.com',
            Referer: 'https://howlongtobeat.com/',
            Authority: 'howlongtobeat.com',
            'User-Agent':
                'Chrome: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
        },
        body: JSON.stringify(data),
    });
}

let CachedApiKey: string | null = null;
async function fetchSearchResults(data: object) {
    CachedApiKey = CachedApiKey || (await fetchApiKey());
    if (CachedApiKey === null) {
        // error already logged
        return null;
    }

    let results = await fetchSearchResultsWithKey(data, CachedApiKey);
    if (results.status === 200) {
        return results;
    }

    // key might have expired, fetch a new one and try again
    CachedApiKey = await fetchApiKey();
    if (CachedApiKey === null) {
        // error already logged
        return null;
    }

    // Whatever the response is, we propagate it to be logged
    return await fetchSearchResultsWithKey(data, CachedApiKey);
}

// Hook to get data from HLTB
function useHltb(appId: number, game: string) {
    const [stats, setStats] = useState<HLTBStats>({
        mainStat: '--',
        mainPlusStat: '--',
        completeStat: '--',
        allStylesStat: '--',
        gameId: undefined,
        lastUpdatedAt: new Date(),
        showStats: true,
    });
    const data = {
        searchType: 'games',
        searchTerms: game.split(' '),
        searchPage: 1,
        size: 20,
        searchOptions: {
            games: {
                userId: 0,
                platform: '',
                sortCategory: 'name',
                rangeCategory: 'main',
                rangeTime: { min: 0, max: 0 },
                gameplay: { perspective: '', flow: '', genre: '' },
                modifier: 'hide_dlc',
            },
            users: {},
            filter: '',
            sort: 0,
            randomizer: 0,
        },
    };

    useEffect(() => {
        const getData = async () => {
            const cache = await getCache<HLTBStats>(`${appId}`);
            if (cache && !needCacheUpdate(cache.lastUpdatedAt)) {
                setStats(cache);
            } else {
                console.log(`get HLTB data for ${appId} and ${game}`);
                try {
                    const result = await fetchSearchResults(data);
                    if (!result) {
                        // failed to get api key, error already logged
                        return;
                    }

                    if (result.status === 200) {
                        const results: SearchResults = await result.json();
                        results.data.forEach((game) => {
                            game.game_name = normalize(game.game_name);
                        });
                        // Search by appId first
                        let gameStats: GameStatsData | undefined =
                            results.data.find(
                                (elem) => elem.profile_steam === appId
                            );
                        // Search by game name if not found by appId
                        if (gameStats === undefined)
                            gameStats = results.data.find(
                                (elem) => elem.game_name === game
                            );
                        // Couldn't find anything, find a close match
                        if (
                            gameStats === undefined &&
                            results.data.length > 0
                        ) {
                            const possibleChoices = results.data
                                .map((gameStat) => {
                                    return {
                                        minEditDistance: get(
                                            game,
                                            gameStat.game_name,
                                            { useCollator: true }
                                        ),
                                        gameStat,
                                    };
                                })
                                .sort((a, b) => {
                                    if (
                                        a.minEditDistance === b.minEditDistance
                                    ) {
                                        return (
                                            b.gameStat.comp_all_count -
                                            a.gameStat.comp_all_count
                                        );
                                    } else {
                                        return (
                                            a.minEditDistance -
                                            b.minEditDistance
                                        );
                                    }
                                });
                            gameStats = possibleChoices[0].gameStat;
                        }
                        let newStats = stats;
                        if (gameStats) {
                            newStats = {
                                mainStat:
                                    gameStats.comp_main > 0
                                        ? (
                                              gameStats.comp_main /
                                              60 /
                                              60
                                          ).toFixed(1)
                                        : '--',
                                mainPlusStat:
                                    gameStats.comp_plus > 0
                                        ? (
                                              gameStats.comp_plus /
                                              60 /
                                              60
                                          ).toFixed(1)
                                        : '--',
                                completeStat:
                                    gameStats.comp_100 > 0
                                        ? (
                                              gameStats.comp_100 /
                                              60 /
                                              60
                                          ).toFixed(1)
                                        : '--',
                                allStylesStat:
                                    gameStats.comp_all > 0
                                        ? (
                                              gameStats.comp_all /
                                              60 /
                                              60
                                          ).toFixed(1)
                                        : '--',
                                gameId: gameStats.game_id,
                                lastUpdatedAt: new Date(),
                                showStats: cache?.showStats ?? true,
                            };
                        }
                        setStats(newStats);
                        updateCache(`${appId}`, newStats);
                    } else {
                        console.error(`HLTB - ${result}`);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };
        if (appId) {
            getData();
        }
    }, [appId]);

    return {
        ...stats,
    };
}

export default useHltb;
