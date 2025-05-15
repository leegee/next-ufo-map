import './Status.scss';
import { useEffect, useState } from 'react';
import { get } from 'react-intl-universal';
import { useSelector } from 'react-redux';

import { selectClusterCount, selectPointsCount } from '../../redux/mapSlice';
import React from 'react';
import { RootState } from '../../redux/store';

const Panel: React.FC = () => {
    const { locale } = useSelector((state: RootState) => state.gui);
    const pointsCount = useSelector(selectPointsCount);
    const clusterCount = useSelector(selectClusterCount);
    const [nothingToShow, setNothingToShow] = useState<boolean>(true);
    const showPoints = !clusterCount && pointsCount && pointsCount > 0;

    useEffect(() => {
        setNothingToShow(!clusterCount && !pointsCount);
    }, [pointsCount, clusterCount, nothingToShow]);

    return (
        <header id='Status' className='component'>
            <span className='inner'>
                {nothingToShow ? (
                    <>
                        {get('status.no_results')}
                    </>
                ) : showPoints ? (
                    <>
                        {get('status.points_count', { count: new Intl.NumberFormat(locale).format(pointsCount) })}
                    </>
                ) : (
                    <>
                        {get('status.cluster_count', { count: new Intl.NumberFormat(locale).format(clusterCount) })}
                    </>
                )}
            </span>
        </header>
    );
};

export default Panel;
