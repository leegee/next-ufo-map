import './DownloadCsvButton.scss';
import React from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../hooks/useDispatch';
import { RootState } from '../../redux/store';
import { fetchCsv } from '../../redux/mapSlice';

const DownloadCsvButton: React.FC = () => {
    const dispatch = useAppDispatch();
    const { requestingCsv } = useSelector((state: RootState) => state.map);

    const download = () => {
        dispatch(fetchCsv());
    };

    return (
        <button title='CSV' aria-label='CSV' disabled={requestingCsv} onClick={download} className='download-csv-button grey component highlightable' />
    );
}

export default DownloadCsvButton;
