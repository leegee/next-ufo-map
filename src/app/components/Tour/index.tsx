import './tour.scss';
import { useState, useEffect } from 'react';
import { get } from 'react-intl-universal';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';

type LocalizedText = {
    title: string;
    description: string;
};

type Step = {
    targetId?: string;
    en: LocalizedText;
    no: LocalizedText;
};

const tourSteps: Step[] = [
    {
        en: {
            title: 'UFO Sightings',
            description: 'Welcome to the UFO sighting map app. Let\'s take a quick Tour.',
        },
        no: {
            title: 'UFO Sightings',
            description: 'Welcome to the UFO sighting map app. Let\'s take a quick Tour.',
        },
    },
    {
        targetId: 'Status',
        en: {
            title: 'Status Display',
            description: 'Shows how many sightings or groups of sightings are dislayed, if any.',
        },
        no: {
            title: 'Status Display',
            description: 'Shows how many sightings or groups of sightings are dislayed, if any.',
        },
    },
    {
        targetId: 'SearchText',
        en: {
            title: 'Search UFO sightings',
            description: 'Enter keywords here to find specific UFO sightings.',
        },
        no: {
            title: 'Search UFO sightings',
            description: 'Enter keywords here to find specific UFO sightings.',
        },
    },
    {
        targetId: 'SourceSelector',
        en: {
            title: 'Select the data source',
            description: 'Opt to use just one data source, or both.',
        },
        no: {
            title: 'Select the data source',
            description: 'Opt to use just one data source, or both.',
        },
    },
    {
        targetId: 'DateRange',
        en: {
            title: 'Date Range',
            description: 'Search within a date range.',
        },
        no: {
            title: 'Date Range',
            description: 'Search within a date range.',
        }
    },
    {
        targetId: 'DownloadCsvButton',
        en: {
            title: 'Download CSV',
            description: 'Click here to export up to 1,000 search results as a CSV file.',
        },
        no: {
            title: 'Download CSV',
            description: 'Click here to export up to 1,000 search results as a CSV file.',
        },
    },

    {
        targetId: 'ThemeToggleButton',
        en: {
            title: 'Background Map',
            description: 'Click here to change the map background.',
        },
        no: {
            title: 'Background Map',
            description: 'Click here to change the map background.',
        }
    },
    {
        targetId: 'LabelsToggleButton',
        en: {
            title: 'Map Labels',
            description: 'Click here to turn off and on the place name labels on the map.',
        },
        no: {
            title: 'Map Labels',
            description: 'Click here to turn off and on the place name labels on the map.',
        }
    },
    {
        targetId: 'LocaleButton',
        en: {
            title: 'Locale',
            description: 'Click here to change the language the application uses.',
        },
        no: {
            title: 'Locale',
            description: 'Click here to change the language the application uses.',
        }
    },
    {
        targetId: 'HelpButton',
        en: {
            title: 'More Information',
            description: 'Click here for more information and contact details.',
        },
        no: {
            title: 'More Information',
            description: 'Click here for more information and contact details.',
        }
    },
];

const TOUR_STEP_CSS_CLASS = 'highlight-tour-element';
const TOUR_STORAGE_KEY = 'ufoAppTourCompleted';
const TOOLTIP_WIDTH = 350;
const OFFSET_Y = 15;

export default function Tour() {
    const { locale } = useSelector((state: RootState) => state.gui);
    const [currentStep, setCurrentStep] = useState(0);
    const [showTour, setShowTour] = useState(false);
    const [pos, setPos] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

    useEffect(() => {
        if (!localStorage.getItem(TOUR_STORAGE_KEY)) setShowTour(true);
    }, []);

    useEffect(() => {
        if (!showTour) return;
        const step = tourSteps[currentStep];
        const el = document.getElementById(step.targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [showTour, currentStep]);

    useEffect(() => {
        if (!showTour) return;
        const step = tourSteps[currentStep];
        const prevStep = tourSteps[currentStep - 1];

        if (prevStep?.targetId) {
            const prevEl = document.getElementById(prevStep.targetId);
            if (prevEl) prevEl.classList.remove(TOUR_STEP_CSS_CLASS);
        }

        const el = document.getElementById(step.targetId || 'Main');

        if (el) {
            el.classList.add(TOUR_STEP_CSS_CLASS);
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const rect = el.getBoundingClientRect();
            let left = rect.left + (rect.width / 2) - TOOLTIP_WIDTH / 2;
            left = Math.max(20, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 20));
            let top = rect.top - OFFSET_Y - 120;
            if (top < 10) {
                top = rect.bottom + OFFSET_Y;
            }

            setPos({ top: top + window.scrollY, left: left + window.scrollX });
        }
    }, [showTour, currentStep]);

    const closeTour = () => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        setShowTour(false);
    };

    if (!showTour) return null;

    const step = tourSteps[currentStep];

    return (
        <div id='TourStep' role="dialog" aria-modal="true" aria-labelledby="tour-title" style={{
            top: pos.top,
            left: pos.left,
        }}>
            <header>
                <h3 id="tour-title">{step[locale].title}</h3>
            </header>

            <p>{step[locale].description}</p>

            <footer>
                {currentStep > 0 ? (
                    <button
                        className='back'
                        onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                        disabled={currentStep === 0}
                        aria-label={get('tour.buttons.back')}
                    >
                        {get('tour.buttons.back')}
                    </button>
                ) : (<>.</>)
                }

                {currentStep === tourSteps.length - 1 ? (
                    <button onClick={closeTour} aria-label={get('tour.buttons.finish')}>
                        {get('tour.buttons.finish')}
                    </button>
                ) : (
                    <button onClick={() => setCurrentStep((s) => s + 1)} aria-label={get('tour.buttons.next')}>
                        {get('tour.buttons.next')}
                    </button>
                )}
            </footer>
        </div>
    );
}
