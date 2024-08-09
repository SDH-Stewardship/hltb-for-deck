import { DialogButtonPrimary, Navigation } from '@decky/ui';
import useHltb from '../../hooks/useHltb';
import { usePreference, useStyle } from '../../hooks/useStyle';
import style from './style';
import { useEffect, useState } from 'react';
import { useStatPreferences } from '../../hooks/useStatPreferences';
import useLocalization from '../../hooks/useLocalization';

type GameStatsProps = {
    game: string;
    appId: number;
    id: string;
};

export const GameStats = ({ game, appId, id }: GameStatsProps) => {
    const [gameLaunching, setGameLaunching] = useState<boolean>(false);
    const lang = useLocalization();
    const handleGameActionStart = (
        _actionType: number,
        strAppId: string,
        actionName: string
    ) => {
        const gameActionAppId = parseInt(strAppId);
        if (
            actionName == 'LaunchApp' &&
            appId == gameActionAppId &&
            !gameLaunching
        ) {
            setGameLaunching(true);
        } else {
            setGameLaunching(false);
        }
    };

    const onGameActionStart = SteamClient.Apps.RegisterForGameActionStart(
        handleGameActionStart
    );
    const onGameActionEnd = SteamClient.Apps.RegisterForGameActionEnd(
        handleGameActionStart
    );
    useEffect(() => {
        return function cleanup() {
            onGameActionStart.unregister();
            onGameActionEnd.unregister();
        };
    }, []);
    const {
        mainStat,
        mainPlusStat,
        completeStat,
        allStylesStat,
        gameId,
        showStats,
    } = useHltb(appId, game);
    const { showMain, showMainPlus, showComplete, showAllStyles } =
        useStatPreferences();
    const hltbStyle = useStyle();
    const hideDetails = usePreference();
    const baseClass = hltbStyle === null ? 'hltb-info-absolute' : 'hltb-info';
    // Hide if there are no stats, show stats is false, all stats are hidden, or the game is launching
    const hide =
        (mainStat === mainPlusStat &&
            mainPlusStat === completeStat &&
            completeStat === allStylesStat &&
            allStylesStat === '--') ||
        !showStats ||
        gameLaunching;
    let hltbInfoStyle = '';
    switch (hltbStyle) {
        case 'clean':
        case 'clean-left':
            hltbInfoStyle = 'hltb-info-clean';
            break;
        case 'clean-default':
            hltbInfoStyle = 'hltb-info-clean-default';
            break;
    }
    const hltbInfoPosition =
        hltbStyle === 'clean-left' ? 'hltb-info-clean-left' : '';
    const btnStyle =
        hltbStyle === 'default' || hltbStyle === 'clean-default'
            ? ''
            : 'hltb-details-btn-clean';

    return (
        <div id={id} style={{ display: hide ? 'none' : 'block' }}>
            {style}
            <div
                className={`${baseClass} ${hltbInfoStyle} ${hltbInfoPosition}`}
            >
                <ul
                    style={{
                        display: 'flex',
                        justifyContent: 'space-evenly',
                    }}
                >
                    <li style={{ display: showMain ? 'block' : 'none' }}>
                        <p className="hltb-gametime">
                            {mainStat} {lang('hours')}
                        </p>
                        <p className="hltb-label">{lang('mainStory')}</p>
                    </li>
                    <li
                        style={{
                            display: showMainPlus ? 'block' : 'none',
                        }}
                    >
                        <p className="hltb-gametime">
                            {mainPlusStat} {lang('hours')}
                        </p>
                        <p className="hltb-label">{lang('mainPlusExtras')}</p>
                    </li>
                    <li
                        style={{
                            display: showComplete ? 'block' : 'none',
                        }}
                    >
                        <p className="hltb-gametime">
                            {completeStat} {lang('hours')}
                        </p>
                        <p className="hltb-label">{lang('completionist')}</p>
                    </li>
                    <li
                        style={{
                            display: showAllStyles ? 'block' : 'none',
                        }}
                    >
                        <p className="hltb-gametime">
                            {allStylesStat} {lang('hours')}
                        </p>
                        <p className="hltb-label">{lang('allStyles')}</p>
                    </li>
                    {gameId && !hideDetails && (
                        <li>
                            <DialogButtonPrimary
                                className={`hltb-details-btn ${btnStyle}`}
                                onClick={() =>
                                    Navigation.NavigateToExternalWeb(
                                        `https://howlongtobeat.com/game/${gameId}`
                                    )
                                }
                            >
                                {lang('viewDetails')}
                            </DialogButtonPrimary>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};
