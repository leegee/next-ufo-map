import React, { type FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'react-intl-universal';
import { useAppDispatch } from '../../hooks/useDispatch';
import type { FeatureSourceAttributeType } from '../../types';
import config from '../../lib/client/config';
import { RootState } from '../../redux/store';
import { fetchFeatures, setSource } from '../../redux/mapSlice';

import './SourceSelector.scss';

const SourceSelector: React.FC = () => {
    const dispatch = useAppDispatch();
    const { source } = useSelector((state: RootState) => state.map);

    if (config.db.database !== 'ufo') {
        return '';
    }

    const options = {
        'norge-ufo': get('source.norge-ufo'),
        'mufon-kaggle': get('source.mufon-kaggle'),
        'not-specified': get('source.not-specified'),
    };

    function handleChange(e: FormEvent<HTMLElement>) {
        console.log((e.target as HTMLSelectElement).value);
        dispatch(setSource((e.target as HTMLSelectElement).value as FeatureSourceAttributeType));
        dispatch(fetchFeatures());
    }

    return <nav id='SourceSelector' className='component highlightable' onChange={handleChange}>
        <select defaultValue={source}>
            {Object.keys(options).map(
                (option) => <option key={option} value={option}>{
                    options[option as unknown as FeatureSourceAttributeType]
                }</option>
            )}
        </select>
    </nav>
}

export default SourceSelector;
