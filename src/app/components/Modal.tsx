'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { get } from 'react-intl-universal';

import './Modal.scss';
import { useRouter } from 'next/navigation';

interface ModalProps {
    children?: ReactNode;
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ children, title }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const router = useRouter();

    function closeModal() {
        setIsOpen(false);
        router.push('/');
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    });

    return isOpen ? (
        <section id="modal">
            <div id='modal-content'>
                <h2>{title}
                    <nav id='modal-close' onClick={closeModal} title={get('close')} aria-label={get('close')}></nav>
                </h2>
                <div id='modal-inner'>
                    {children}
                </div>
            </div>
        </section>
    ) : null;
};

export default Modal;
