'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get } from 'react-intl-universal';

import { RootState } from '../redux/store';
import { setLocaleKey } from '../redux/guiSlice';

import './LocaleButton.scss';

const LocaleButton = () => {
    const dispatch = useDispatch();
    const { locale } = useSelector((state: RootState) => state.gui);

    const toggleLocale = () => {
        const newLocale = locale === 'no' ? 'en' : 'no';
        dispatch(setLocaleKey(newLocale));
    };

    return (
        <nav>
            {locale ? (
                <button
                    title={get('map.buttons.locale')}
                    className='map-ctrl locale-ctrl'
                    onClick={toggleLocale}
                >
                    {locale === 'no' ? '🇬🇧' : '🇳🇴'}
                </button>
            ) : (
                <span>Locale {locale} not installed.</span>
            )}
        </nav>
    );
};

export default LocaleButton;
