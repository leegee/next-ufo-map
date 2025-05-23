import './Toolbar.scss';
import React from 'react';
import DateRange from './Toolbar/DateRange';
import SearchText from './Toolbar/SearchText';
import ReportCount from './Toolbar/Status';
import DownloadCsvButton from './Toolbar/DownloadCsvButton';
import SourceSelector from './Toolbar/SourceSelector';
import HelpButton from './Map/HelpButton';

const Toolbar: React.FC = () => {
    return (
        <nav className="toolbar">
            <ReportCount />
            <input type="checkbox" id="menu-toggle" hidden />
            <label htmlFor="menu-toggle" className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
            </label>

            <div className="toolbar-items">
                <SearchText />
                <span className='row'>
                    <SourceSelector />
                    <DateRange />
                </span>
                <DownloadCsvButton />
                <HelpButton />
            </div>
        </nav>
    );
};

export default Toolbar;
