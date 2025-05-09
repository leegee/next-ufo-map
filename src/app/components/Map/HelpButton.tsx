import React from 'react';
import { get } from 'react-intl-universal';

import './HelpButton.scss';
import { useRouter } from 'next/navigation';

const HelpButton: React.FC = () => {
    const router = useRouter();
    const handleClick = () => {
        router.push('/about');
    }

    return (
        <button onClick={handleClick} id='help-butto-ctrl' className='map-ctrl highlightable ol-unselectable' title={get('info')} aria-label={get('info')} />
    );
};

export default HelpButton;
