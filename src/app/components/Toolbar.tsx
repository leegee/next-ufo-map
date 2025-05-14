import React from 'react';
import './Toolbar.scss';

import DateRange from './Toolbar/DateRange';
import SearchText from './Toolbar/SearchText';
import ReportCount from './Toolbar/Status';
import DownloadCsvButton from './Toolbar/DownloadCsvButton';
import SourceSelector from './Toolbar/SourceSelector';

const Toolbar: React.FC = () => {
    return (
        <nav className="toolbar">
            <ReportCount />
            <input type="checkbox" id="menu-toggle" />
            <label htmlFor="menu-toggle" className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
            </label>

            <div className="toolbar-items">
                <SourceSelector />
                <DateRange />
                <SearchText />
                <DownloadCsvButton />
            </div>
        </nav>
    );
};

export default Toolbar;
