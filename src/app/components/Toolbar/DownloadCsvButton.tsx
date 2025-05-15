import './DownloadCsvButton.scss';
import React from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../hooks/useDispatch';
import { RootState } from '../../redux/store';
import { fetchCsv } from '../../redux/mapSlice';
import { get } from 'react-intl-universal';

const DownloadCsvButton: React.FC = () => {
    const dispatch = useAppDispatch();
    const { locale } = useSelector((state: RootState) => state.gui);
    const { requestingCsv } = useSelector((state: RootState) => state.map);

    const download = () => {
        dispatch(fetchCsv());
    };

    return (
        <button
            id='DownloadCsvButton'
            lang={locale}
            data-title={get('download_csv')}
            title={get('download_csv')}
            aria-label={get('download_csv')}
            disabled={requestingCsv}
            onClick={download}
            className='grey component highlightable'
        />
    );
}

export default DownloadCsvButton;
