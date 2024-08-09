import {
    afterPatch,
    appDetailsClasses,
    createReactTreePatcher,
    findInReactTree,
} from '@decky/ui';
import { routerHook } from '@decky/api';
import { ReactElement } from 'react';
import { GameStats } from '../components/GameStats/GameStats';
import { normalize } from '../utils';

// I hate this method
export const patchAppPage = () => {
    return routerHook.addPatch('/library/app/:appid', (routerTree: any) => {
        const routeProps = findInReactTree(
            routerTree,
            (x: any) => x?.renderFunc
        );
        if (routeProps) {
            let game: string;
            let appId: number;

            const patchHandler = createReactTreePatcher(
                [
                    (tree: any) => {
                        const children = findInReactTree(
                            tree,
                            (x: any) => x?.props?.children?.props?.overview
                        )?.props?.children;
                        if (!children) {
                            console.error(
                                'Failed to patch renderFunc@children!'
                            );
                            return null;
                        }

                        const overview = children.props.overview;
                        game = normalize(overview.display_name);
                        appId = overview.appid;

                        return children;
                    },
                ],
                (_: Record<string, unknown>[], ret: ReactElement) => {
                    const componentToSplice = findInReactTree(
                        ret,
                        (x: any) =>
                            Array.isArray(x?.props?.children) &&
                            x?.props?.className?.includes(
                                appDetailsClasses.InnerContainer
                            )
                    ).props?.children;
                    // This always seems to be -1
                    const hltbComponentIndex = componentToSplice.findIndex(
                        (child: ReactElement) => {
                            return child?.props?.id === 'hltb-for-deck';
                        }
                    );

                    // We want to splice into the component before this point
                    const spliceIndex = componentToSplice?.findIndex(
                        (child: ReactElement) => {
                            return (
                                child?.props?.childFocusDisabled !==
                                    undefined &&
                                child?.props?.navRef !== undefined &&
                                child?.props?.children?.props?.details !==
                                    undefined &&
                                child?.props?.children?.props?.overview !==
                                    undefined &&
                                child?.props?.children?.props?.bFastRender !==
                                    undefined
                            );
                        }
                    );

                    const component = (
                        <GameStats
                            id="hltb-for-deck"
                            game={game}
                            appId={appId}
                        />
                    );

                    if (hltbComponentIndex < 0) {
                        if (spliceIndex > -1) {
                            componentToSplice?.splice(
                                spliceIndex,
                                0,
                                component
                            );
                        } else {
                            console.error(
                                'hltb-for-deck could not find where to splice!'
                            );
                        }
                    } else {
                        componentToSplice?.splice(
                            hltbComponentIndex,
                            1,
                            component
                        );
                    }
                    return ret;
                }
            );
            afterPatch(routeProps, 'renderFunc', patchHandler);
        }
        return routerTree;
    });
};
