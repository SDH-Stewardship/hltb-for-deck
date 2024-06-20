import { PropsWithChildren, VFC } from 'react';
import { DialogButtonPrimary, ProgressBar } from 'decky-frontend-lib';
import useLocalization from '../../hooks/useLocalization';
import { cacheQueue } from './data';
import { useStore } from 'zustand';

const progressStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    height: '100%',
    margin: '0 auto',
    color: 'white',
    textTransform: 'uppercase',
    fontSize: '12px',
    fontWeight: '700',
} as const;

const Progress: VFC<PropsWithChildren<{}>> = (props) => {
    const { current, total, abort } = useStore(cacheQueue);

    const lang = useLocalization();

    return current === 0 ? (
        <>{props.children}</>
    ) : (
        <div style={progressStyles}>
            {lang('loadingData').replace('{{total}}', total.toString())}
            <ProgressBar
                nTransitionSec={0}
                nProgress={(current / total) * 100}
            />
            <DialogButtonPrimary
                style={{ marginTop: '16px', width: 'fit-content' }}
                onClick={abort}
            >
                Cancel
            </DialogButtonPrimary>
        </div>
    );
};

export default Progress;
