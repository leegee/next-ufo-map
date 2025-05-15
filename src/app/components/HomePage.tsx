"use client";
// TODO remove "use client" ASAP

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../redux/store';
import ResultsPanel from './ResultsPanel';
import Toolbar from './Toolbar';
import Map from './Map';
import Tour from './Tour';

const REPORT_FULL_WIDTH = 'REPORT_FULL_WIDTH';
const REPORT_NARROW_WIDTH = 'REPORT_NARROW_WIDTH';

function setScreenSizeClass() {
    if (window.innerWidth < 768) {
        document.body.classList.add('SMALL-SCREEN');
        document.body.classList.remove('LARGER-SCREEN');
    } else {
        document.body.classList.remove('SMALL-SCREEN');
        document.body.classList.add('LARGER-SCREEN');
    }
}

const HomePage: React.FC = () => {
    const appElementRef = useRef<HTMLDivElement>(null);
    const [appClasses, setAppClasses] = useState('');
    const { panel } = useSelector((state: RootState) => state.gui);
    // TODO move to Map etc
    // const { requestingFeatures } = useSelector((state: RootState) => state.map);

    useEffect(() => {
        window.addEventListener('resize', setScreenSizeClass);
        setScreenSizeClass();
        return () => window.removeEventListener('resize', setScreenSizeClass);
    }, []);

    // useEffect(() => {
    //     if (requestingFeatures) {
    //         document.body.classList.add('loading');
    //     } else {
    //         document.body.classList.remove('loading');
    //     }
    // }, [requestingFeatures]);

    useEffect(() => {
        let widthClass = '';
        if (panel === 'full') {
            widthClass = REPORT_FULL_WIDTH;
        } else if (panel === 'narrow') {
            widthClass = REPORT_NARROW_WIDTH;
        }
        setAppClasses(widthClass + ' panel-is-' + panel);
    }, [panel]);

    return (
        <main id='Main' ref={appElementRef} className={appClasses}>
            <Toolbar />
            <Tour />
            <section id="map-panel-container">
                <Map />
                <ResultsPanel />
            </section>
        </main>
    );
}

export default HomePage;
