import './ReportToggleButton.scss';
import React from 'react';
import { get } from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setPanel } from '../redux/guiSlice';


const ReportButton: React.FC = () => {
    const dispatch = useDispatch();
    const { panel } = useSelector((state: RootState) => state.gui);
    const { requestingFeatures: featuresAreLoading } = useSelector((state: RootState) => state.map);

    const togglePanel = () => {
        if (panel === 'full') {
            dispatch(setPanel('narrow'));
        } else {
            dispatch(setPanel('full'));
        }
    };

    return (
        <button id='ReportButton' disabled={featuresAreLoading} className='component highlightable' onClick={togglePanel}>
            {panel === 'full' ? (
                <span className='close-full-width' title={get('close')} aria-label={get('close')} />
            ) : (
                <span className='open-full-width' title={get('open')} aria-label={get('open')} />
            )}
        </button>
    );
};

export default ReportButton;
