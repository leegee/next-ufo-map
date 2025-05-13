import './SearchText.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'react-intl-universal';
import debounce from 'debounce';
import config from '../../lib/client/config';
import { fetchFeatures, setQ } from '../../redux/mapSlice';
import { RootState } from '../../redux/store';
import { useAppDispatch } from '../../hooks/useDispatch';

const DEBOUNCE_INPUT_MS = 500;

const SearchText: React.FC = () => {
    const dispatch = useAppDispatch();
    const { q } = useSelector((state: RootState) => state.map);
    const [localQ, setLocalQ] = useState<string>(String(q || ''));

    const debouncedFetchRequest = useMemo(() =>
        debounce((value: string) => {
            if (value.trim().length === 0 || value.length >= config.minQLength) {
                dispatch(setQ(value));
                dispatch(fetchFeatures());
            }
        }, DEBOUNCE_INPUT_MS)
        , [dispatch]);

    const handleQChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLocalQ(value);
        debouncedFetchRequest(value);
    };

    useEffect(() => {
        return () => {
            debouncedFetchRequest.clear();
        };
    }, [debouncedFetchRequest]);

    return (
        <nav id='SearchText' className='component highlightable'>
            <span className='grey search-icon' />
            <input
                title={get('search_text.title', { minChars: config.minQLength })}
                aria-label={get('search_text.title', { minChars: config.minQLength })}
                type='search'
                id='q'
                name='q'
                value={localQ}
                onChange={handleQChange}
                minLength={config.minQLength}
                placeholder={get('search_text.placeholder')}
            />
        </nav>
    );
}

export default SearchText;
