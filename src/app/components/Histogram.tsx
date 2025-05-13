import React, { useEffect, useState } from 'react';
import { get } from 'react-intl-universal';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData,
} from 'chart.js';

import { selectPointsCount } from '../redux/mapSlice';
import { RootState } from '../redux/store';
import Modal from './Modal';

import './Histogram.scss';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Histogram: React.FC = () => {
    const pointsCount = useSelector(selectPointsCount);
    const { featureCollection } = useSelector((state: RootState) => state.map);

    const [yearOneCount, setYearOneCount] = useState(0);
    const [data, setData] = useState<ChartData<'bar'> | null>(null);
    const [options, setOptions] = useState<ChartOptions<'bar'> | null>(null);

    useEffect(() => {
        if (!featureCollection?.features || !pointsCount) return;

        const yearValues: number[] = featureCollection.features
            .map((feature) => new Date(feature.properties.datetime as string).getFullYear())
            .filter((year) => {
                if (year === 1) {
                    setYearOneCount((prev) => prev + 1);
                }
                return year !== 1;
            });

        const lowestYear = Math.min(...yearValues);
        const highestYear = Math.max(...yearValues);

        const yearCount: Record<number, number> = {};

        yearValues.forEach((year) => {
            yearCount[year] = (yearCount[year] || 0) + 1;
        });

        for (let year = lowestYear; year <= highestYear; year++) {
            if (!yearCount[year]) {
                yearCount[year] = 0;
            }
        }

        const labels = Object.keys(yearCount).sort();

        const newOptions: ChartOptions<'bar'> = {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                    text: get('histogram.title'),
                },
            },
        };

        const newData: ChartData<'bar'> = {
            labels,
            datasets: [
                {
                    label: get('histogram.reports_per_year'),
                    data: labels.map((year) => yearCount[Number(year)]),
                    backgroundColor: 'orange',
                },
            ],
        };

        setData(newData);
        setOptions(newOptions);
    }, [featureCollection, pointsCount]);

    return pointsCount ? (
        <Modal title={get('histogram.title')}>
            <section>
                {data && options && <Bar data={data} options={options} />}
            </section>
        </Modal>
    ) : null;
};

export default Histogram;
