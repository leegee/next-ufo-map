import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPanel } from '../redux/guiSlice';
import { RootState } from '../redux/store';

const OpenReport: React.FC = () => {
    const dispatch = useDispatch();
    const { panel } = useSelector((state: RootState) => state.gui);
    const previousPanelRef = useRef(panel);

    useEffect(() => {
        previousPanelRef.current = panel;

        dispatch(setPanel('full'));

        return () => {
            dispatch(setPanel(previousPanelRef.current));
        };
    });

    return null;
};

export default OpenReport;
