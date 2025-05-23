'use client';
import React, { useEffect } from 'react';
import { get } from 'react-intl-universal';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../hooks/useDispatch';
import Modal from './Modal';
import { RootState } from '../redux/store';
import { fetchSightingDetails } from '../redux/details';

import './SightingDetails.css';

const SightingDetails = ({ id }: { id: string }) => {
    const dispatch = useAppDispatch();
    const { loading, error, details } = useSelector((state: RootState) => state.details);

    useEffect(() => {
        console.log(id);
        dispatch(fetchSightingDetails(id));
    }, [dispatch, id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Modal title={get('sighting_details.title') + ' ' + id}>
            <section id='sighting-details'>
                <table>
                    <tbody>
                        {Object.keys(details)
                            .filter((column: string) => column !== 'point' && details[column] !== null)
                            .map((column: string, index: number) => (
                                <tr key={index}>
                                    <th>{column}</th>
                                    <td>{details[column]?.toString()}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </section>
        </Modal>
    );
};

export default SightingDetails;
