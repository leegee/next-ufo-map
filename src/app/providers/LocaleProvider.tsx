'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import intlUniversal from 'react-intl-universal';

import en from '../locales/en.json';
import no from '../locales/no.json';
import se from '../locales/se.json';

export const locales = {
    en,
    no,
    se,
};

type LocaleKey = keyof typeof locales;

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
    const locale = useSelector((state: RootState) => state.gui.locale);
    const [initDone, setInitDone] = useState(false);

    useEffect(() => {
        const loadLocale = async () => {
            const fallbackLocale: LocaleKey = 'en';
            const validLocale = locales[locale] ? locale : fallbackLocale;

            try {
                await intlUniversal.init({
                    currentLocale: validLocale,
                    locales: { [validLocale]: locales[validLocale] },
                });
                setInitDone(true);
            } catch (err) {
                console.error('Failed to initialize intlUniversal', err);
                setInitDone(true);
            }
        };

        setInitDone(false);
        loadLocale();
    }, [locale]);

    if (!initDone) return null;

    return <>{children}</>;
}
