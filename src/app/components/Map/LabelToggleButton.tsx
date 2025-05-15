import './LabelToggleButton.scss';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { setShowLabels } from '../../redux/guiSlice';
import { get } from 'react-intl-universal';


const LabelToggleButton: React.FC = () => {
    const dispatch = useDispatch();
    const { showLabels } = useSelector((state: RootState) => state.gui);


    const handleClick = () => {
        dispatch(setShowLabels(!showLabels));
    }

    return (
        <button
            id='LabelsToggleButton'
            title={get('map.buttons.labels')}
            data-active={showLabels}
            onClick={handleClick}
            className='map-ctrl highlightable ol-unselectable ol-control'
        />
    );
};

export default LabelToggleButton;
