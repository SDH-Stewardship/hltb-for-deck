import { findModule } from 'decky-frontend-lib';
import * as MOBX from 'mobx';

export const Mobx: typeof MOBX = findModule(
    (m) => typeof m === 'object' && '$mobx' in m
);

export const MobxReact = findModule(
    (m) => typeof m === 'object' && 'MobXProviderContext' in m
);

export const L10n = findModule((m) => typeof m === 'object' && 'Localize' in m);
