import {
    afterPatch,
    replacePatch,
    RoutePatch,
    ServerAPI,
    showContextMenu,
} from 'decky-frontend-lib';
import { ReactElement } from 'react';
import SortByMenu from '../components/SortBy/SortByMenu';
import { wrapCollection, cacheQueue, Progress } from '../components/SortBy';

const patchTabs = (
    serverAPI: ServerAPI,
    tabs: Array<any>,
    activeTab: string
) => {
    for (const tab of tabs) {
        const { setSortBy, eSortBy, collection } = tab.content.props;

        tab.content.props.showSortingContextMenu = () =>
            showContextMenu(<SortByMenu setSortBy={setSortBy} />);

        if (tab.footer) {
            tab.footer.onOptionsButton =
                tab.content.props.showSortingContextMenu;
        }

        if (
            tab.id === activeTab &&
            eSortBy > 40 &&
            eSortBy < 45 &&
            collection
        ) {
            collection.visibleApps.forEach(cacheQueue.getState().put);
            cacheQueue.getState().run(serverAPI);

            tab.content.props.collection = wrapCollection(eSortBy, collection);
            tab.content.props.eSortBy = 4;
        }
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

                                    const { tabs, activeTab } =
                                        ret3.props.children.props.children[1]
                                            .props;

                                    patchTabs(serverAPI, tabs, activeTab);

                                    return ret3;
                                }
                            );

                            return <Progress>{ret2}</Progress>;
                        }
                    );

                    return ret1;
                }
            );

            return props;
        }
    );
