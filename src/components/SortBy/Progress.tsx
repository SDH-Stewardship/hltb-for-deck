import { PropsWithChildren, ReactNode, VFC } from 'react';
import { DialogButtonPrimary, ProgressBar } from 'decky-frontend-lib';
import { MobxReact } from '../../module';
import useLocalization from '../../hooks/useLocalization';
import { cacheHltbDataProgress } from './data';

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

const Progress: VFC<PropsWithChildren<{}>> = MobxReact.observer(
    ({ children }: { children?: ReactNode | undefined }) => {
        const lang = useLocalization();

        const { current, total } = cacheHltbDataProgress;

        return current === 0 ? (
            <>{children}</>
        ) : (
            <div style={progressStyles}>
                {lang('loadingData').replace('{{total}}', total.toString())}
                <ProgressBar
                    nTransitionSec={0}
                    nProgress={(current / total) * 100}
                />
                <DialogButtonPrimary
                    style={{ marginTop: '16px', width: 'fit-content' }}
                    onClick={() => cacheHltbDataProgress.reset()}
                >
                    Cancel
                </DialogButtonPrimary>
            </div>
        );
    }
);

export default Progress;
