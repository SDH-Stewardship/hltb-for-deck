import {
    afterPatch,
    replacePatch,
    RoutePatch,
    ServerAPI,
    wrapReactType,
} from 'decky-frontend-lib';
import { ReactElement } from 'react';
import { fakeUseCallback, useResetOnUnmount } from '../components/SortBy';
import { Progress } from '../components/SortBy/Progress';
import { useSortBy } from '../module';

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
                            'hltb-for-deck failed to find outer library element to patch'
                        );
                        return ret1;
                    }

                    const { setSortBy } = useSortBy();

                    useResetOnUnmount();

                    let cache: any;

                    // This patch always runs twice
                    afterPatch(
                        ret1,
                        'type',
                        (_: unknown, ret2: ReactElement) => {
                            if (!ret2?.type) {
                                console.error(
                                    'hltb-for-deck failed to find inner library element to patch'
                                );
                                return ret2;
                            }

                            if (cache) {
                                ret2.type = cache;
                            } else {
                                // @ts-ignore
                                const origMemoComponent = ret2.type.type;
                                wrapReactType(ret2);

                                replacePatch(ret2.type, 'type', (args) => {
                                    const hooks = (window.SP_REACT as any)
                                        .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
                                        .ReactCurrentDispatcher.current;

                                    const realUseCallback = hooks.useCallback;
                                    hooks.useCallback = fakeUseCallback(
                                        realUseCallback,
                                        setSortBy,
                                        serverAPI
                                    );
                                    const res = origMemoComponent(...args);
                                    hooks.useCallback = realUseCallback;

                                    return res;
                                });

                                cache = ret2.type;
                            }

                            return (
                                <>
                                    {ret2}
                                    <Progress />
                                </>
                            );
                        }
                    );

                    return ret1;
                }
            );

            return props;
        }
    );
