import './HelpButton.scss';
import React, { useState } from 'react';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { get } from 'react-intl-universal';
import About from '../../about/page';

const HelpButton: React.FC = () => {
    const { locale } = useSelector((state: RootState) => state.gui);
    const [showModal, setShowModal] = useState(false);
    const handleClick = () => setShowModal(!showModal);

    return (
        <>
            <button
                id='HelpButton'
                lang={locale}
                title={get('open_help_about')}
                data-title={get('open_help_about')}
                aria-label={get('open_help_about')}
                onClick={handleClick}
                className='grey component highlightable'
            />

            {showModal && createPortal(<About />, document.body)}
        </>
    );
};

export default HelpButton;
