import React from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
export const MainLayout: React.FC<{ children: React.ReactNode; baseUrl: string }> = ({ children, baseUrl }) => {
    const { t } = useTranslation();
    return (
        <>
            <h1>{baseUrl}</h1>
            <main role="main">
                <main>{children}</main>
            </main>
        </>
    );
};
