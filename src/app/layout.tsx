"use client";

import './styles/global.scss';
import 'react-toastify/dist/ReactToastify.css';

import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
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
                        <ToastContainer position="top-right" />
                    </LocaleProvider>
                </body>
            </html>
        </Provider>
    );
}
