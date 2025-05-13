"use client";

import './styles/global.scss';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import IntlProvider from './providers/IntlProvider';

interface IRootLayoutProps {
    children: React.ReactNode;
    searchParams: Record<string, string> | null | undefined;
}

export default function RootLayout({ children, searchParams }: IRootLayoutProps) {
    const showModal = searchParams?.modal;

    return (
        <Provider store={store}>
            <html lang="en">
                <body>
                    <IntlProvider>
                        {children}
                    </IntlProvider>
                </body>
            </html>
        </Provider>
    );
}
