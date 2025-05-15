/**
 * This chap handles the positioning of the results table, which is always set to fill avialable space
*/

import './ResultsPanel.scss';
import React, { useEffect, useState } from 'react';
import { get } from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import { selectClusterCount, selectPointsCount } from '../redux/mapSlice';
import type { RootState } from '../redux/store';
import { setPanel } from '../redux/guiSlice';
import FeatureTable from './FeaturesTable';
import ReportToggleButton from './ReportToggleButton';


const ResultsPanel: React.FC = () => {
    const dispatch = useDispatch();
    const { panel } = useSelector((state: RootState) => state.gui);

    const pointsCount = useSelector(selectPointsCount);
    const clusterCount = useSelector(selectClusterCount);
    const [nothingToShow, setNothingToShow] = useState<boolean>(true);

    const onEscCloseFullReport = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && panel === 'full') {
            dispatch(setPanel('hidden'))
        }
    };

    useEffect(() => {
        document.addEventListener('keyup', onEscCloseFullReport);
        return () => document.removeEventListener('keyup', onEscCloseFullReport)
    });

    useEffect(() => {
        if (pointsCount) {
            setPanel(nothingToShow ? 'narrow' : 'hidden')
        }
        console.log('xxx', clusterCount, pointsCount)
        setNothingToShow(!clusterCount && !pointsCount);

    }, [pointsCount, clusterCount, nothingToShow]);

    return (
        <>
            <section id='ResultsPanel' className={(nothingToShow || clusterCount) ? 'nothing-to-show' : ''}>
                {nothingToShow ? (
                    <p className='message'>
                        {get('panel.no_results')}
                    </p>
                ) :
                    !clusterCount ?
                        <FeatureTable />
                        : <div className='message' dangerouslySetInnerHTML={{ __html: get('panel.only_clusters_not_points') }} />
                }
            </section>


            {!nothingToShow && !clusterCount && <ReportToggleButton />}
        </>
    );
};

export default ResultsPanel;
