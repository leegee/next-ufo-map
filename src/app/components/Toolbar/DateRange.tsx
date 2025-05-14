import './DateRange.scss';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'react-intl-universal';

import { MapDictionaryType } from '../../types';
import { fetchFeatures, setFromDate, setToDate, selectClusterCount } from '../../redux/mapSlice';
import { RootState } from '../../redux/store';
import { useAppDispatch } from '../../hooks/useDispatch';
import Histogram from '../Histogram';

const DateRange: React.FC = () => {
    const dispatch = useAppDispatch();
    const dictionary: MapDictionaryType | undefined = useSelector((state: RootState) => state.map.dictionary);
    const clusterCount = useSelector(selectClusterCount);
    const { from_date, to_date } = useSelector((state: RootState) => state.map);
    const [localFromDate, setLocalFromDate] = useState(from_date);
    const [localToDate, setLocalToDate] = useState(to_date);
    const [showHistogram, setShowHistogram] = useState(false);

    useEffect(() => {
        if (dictionary?.datetime) {
            setLocalFromDate(dictionary.datetime.min ?? undefined);
            setLocalToDate(dictionary.datetime.max ?? undefined);
        }
    }, [dispatch, dictionary]);

    function handleSubmit() {
        // TODO restore the checks from history
        if (isNaN(Number(localFromDate))) {
            setLocalFromDate(undefined);
        }
        if (isNaN(Number(localToDate))) {
            setLocalToDate(undefined);
        }

        if (!localFromDate || !localToDate || localFromDate < localToDate) {
            dispatch(setFromDate(localFromDate));
            dispatch(setToDate(localToDate));
            dispatch(fetchFeatures());
        }
    }

    function handleFromDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value: string | number = parseInt(e.target.value);
        // if (isNaN(value)) {
        //     value = '';
        // }
        setLocalFromDate(value);
    }

    function handleToDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        let value: number | undefined = Number(parseInt(e.target.value));
        if (isNaN(value)) {
            value = undefined;
        }
        setLocalToDate(value);
    }

    function handleHistogram() {
        setShowHistogram(!showHistogram);
    }

    function handleNoHistogram() {
        alert('Zoom in to view points and click again to view a histogram of the date distribution.')
    }

    return (
        <nav className='date-range component highlightable'>
            {!clusterCount ? (
                <span onClick={handleHistogram} className='grey calendar-icon' title={get('date_range.histogram-button')} aria-label={get('date_range.histogram-button')} />
            ) : (
                <span onClick={handleNoHistogram} className='grey calendar-icon' title={get('date_range.title')} aria-label={get('date_range.title')} />
            )}
            <input
                title={get('date_range.min')}
                aria-label={get('date_range.min')}
                type='number'
                id='minYear'
                name='minYear'
                value={localFromDate ?? ''}
                onChange={handleFromDateChange}
            />
            -
            <input
                title={get('date_range.max')}
                aria-label={get('date_range.max')}
                type='number'
                id='maxYear'
                name='maxYear'
                value={localToDate ?? ''}
                onChange={handleToDateChange}
            />

            <span className='submit' onClick={handleSubmit} title={get('date_range.submit')} aria-label={get('date_range.submit')}>▶</span>

            {showHistogram && <Histogram />}
        </nav>
    );
}

export default DateRange;
