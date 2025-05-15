import './HelpButton.scss';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { get } from 'react-intl-universal';
import About from '../../about/page';

const HelpButton: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const handleClick = () => setShowModal(!showModal);

    return (
        <>
            <button onClick={handleClick} id='HelpButton' className='map-ctrl highlightable ol-unselectable' title={get('info')} aria-label={get('info')} />

            {showModal && createPortal(<About />, document.body)}
        </>
    );
};

export default HelpButton;
