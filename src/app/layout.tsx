"use client";

import './styles/global.scss';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import LocaleProvider from './providers/LocaleProvider';

interface IRootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: IRootLayoutProps) {
    return (
        <Provider store={store}>
            <html lang="en">
                <body>
                    <LocaleProvider>
                        {children}
                    </LocaleProvider>
                </body>
            </html>
        </Provider>
    );
}
