import {
    afterPatch,
    replacePatch,
    RoutePatch,
    ServerAPI,
    showContextMenu,
} from 'decky-frontend-lib';
import { ReactElement } from 'react';
import SortByMenu from '../components/SortBy/SortByMenu';
import {
    cacheHltbData,
    Progress,
    wrapAppOverviews,
} from '../components/SortBy';

const patchTab = (serverAPI: ServerAPI, tab: any, ret: ReactElement) => {
    const props = ret.props;

    props.showSortingContextMenu = () =>
        showContextMenu(<SortByMenu setSortBy={props.setSortBy} />);
    tab.footer.onOptionsButton = props.showSortingContextMenu;

    if (props.eSortBy > 40 && props.eSortBy < 45) {
        cacheHltbData(serverAPI, props.appOverviews);
        props.appOverviews = wrapAppOverviews(
            props.eSortBy,
            props.appOverviews
        );
        props.eSortBy = 4;
    }

    afterPatch(ret, 'type', (_: unknown, ret2: ReactElement) => {
        const unplayed = ret2?.props?.children[1]?.props?.childSections?.find(
            (s: any) => s.subSectionName === 'Unplayed'
        );

        if (unplayed) {
            unplayed.subSectionName = 'Not found';
        }

        return ret2;
    });
};

const patchTabs = (serverAPI: ServerAPI, tabs: Array<any>) => {
    for (const tab of tabs) {
        afterPatch(tab.content, 'type', (_: unknown, ret: ReactElement) => {
            if (ret?.props?.children[1]) {
                // Root tabs
                patchTab(serverAPI, tab, ret.props.children[1]);
            } else if (typeof ret?.props?.children[0]?.type === 'function') {
                // Collections
                afterPatch(
                    ret.props.children[0],
                    'type',
                    (_: unknown, ret2: ReactElement) => {
                        if (!ret2.props.children[1]?.type) {
                            console.error(
                                'hltb-for-deck failed to find fourth library element to patch'
                            );
                            return ret2;
                        }

                        afterPatch(
                            ret2.props.children[1],
                            'type',
                            (_: unknown, ret3: ReactElement) => {
                                patchTab(
                                    serverAPI,
                                    tab,
                                    ret3.props.children[1]
                                );

                                return ret3;
                            }
                        );

                        return ret2;
                    }
                );
            }

            return ret;
        });
    }
};

export const patchLibrary = (serverAPI: ServerAPI): RoutePatch =>
    serverAPI.routerHook.addPatch(
        '/library',
        (props: { path: string; children: ReactElement }) => {
            afterPatch(
                props.children,
                'type',
                (_: unknown, ret1: ReactElement) => {
                    if (!ret1?.type) {
                        console.error(
                            'hltb-for-deck failed to find first library element to patch'
                        );
                        return ret1;
                    }

                    let cache: any;

                    // This patch always runs twice
                    afterPatch(
                        ret1,
                        'type',
                        (_: unknown, ret2: ReactElement) => {
                            if (!ret2?.type) {
                                console.error(
                                    'hltb-for-deck failed to find second library element to patch'
                                );
                                return ret2;
                            }

                            if (cache) {
                                ret2.type = cache;
                            } else {
                                // @ts-ignore
                                const origPatch = ret2.type.type.__deckyPatch;
                                // @ts-ignore
                                const origComponent = ret2.type.type;

                                replacePatch(
                                    ret2.type,
                                    'type',
                                    (args: Array<unknown>) => {
                                        // Workaround to maintain compatibility with TabMaster
                                        const ret3 = origPatch
                                            ? origPatch.handler(args)
                                            : origComponent(...args);

                                        patchTabs(
                                            serverAPI,
                                            ret3.props.children.props
                                                .children[1].props.tabs
                                        );

                                        return ret3;
                                    }
                                );

                                cache = ret2.type;
                            }

                            return <Progress>{ret2}</Progress>;
                        }
                    );

                    return ret1;
                }
            );

            return props;
        }
    );
