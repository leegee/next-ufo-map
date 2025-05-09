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
            <SourceSelector />
            <DateRange />
            <SearchText />
            <DownloadCsvButton />
        </nav>
    );
};

export default Toolbar;
