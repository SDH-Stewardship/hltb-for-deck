import { VFC } from 'react';
import { ProgressBar } from 'decky-frontend-lib';
import { MobxReact } from '../../module';
import useLocalization from '../../hooks/useLocalization';
import { patchAppDetailsProgress } from './appDetails';

const progressStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    position: 'fixed',
    zIndex: '10',
    top: '120px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'black',
    boxShadow: '0px 0px 20px rgba(0,0,0,0.5)',
    color: 'white',
    borderRadius: '4px',
    padding: '12px 16px',
    textTransform: 'uppercase',
    fontSize: '12px',
    fontWeight: '700',
} as const;

export const Progress: VFC = MobxReact.observer(() => {
    const lang = useLocalization();

    const { current, total } = patchAppDetailsProgress;

    return current === 0 ? null : (
        <div style={progressStyles}>
            {lang('loadingData').replace('{{total}}', total.toString())}
            <ProgressBar
                nTransitionSec={0}
                nProgress={(current / total) * 100}
            />
        </div>
    );
});
