
'use client';

import './LocaleButton.scss';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get } from 'react-intl-universal';

import { RootState } from '../redux/store';
import { setLocaleKey } from '../redux/guiSlice';
import { locales } from '../providers/LocaleProvider';

const LocaleButton = () => {
    const dispatch = useDispatch();
    const { locale } = useSelector((state: RootState) => state.gui);

    useEffect(() => console.log('change', locale))

    const toggleLocale = () => {
        console.log(locales);
        const localeKeys = Object.keys(locales);
        const currentIndex = localeKeys.indexOf(locale);
        const nextIndex = (currentIndex + 1) % localeKeys.length;
        dispatch(setLocaleKey(localeKeys[nextIndex]));
    };

    const localeEmoji: Record<string, string> = {
        en: '🇬🇧',
        no: '🇳🇴',
    };

    const emoji = localeEmoji[locale] || '🌐';

    return (
        <nav>
            {locale ? (
                <button
                    id='LocaleButton'
                    title={get('map.buttons.locale')}
                    className='map-ctrl locale-ctrl'
                    onClick={toggleLocale}
                >
                    {emoji}
                </button>
            ) : (
                <span>{locale}?</span>
            )}
        </nav>
    );
};

export default LocaleButton;
