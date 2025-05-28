import React from 'react';
import { Link } from 'react-router-dom';

export const CleanLayout: React.FC<{ children: React.ReactNode; baseUrl: string }> = ({ children, baseUrl }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            {children}
            <Link className="btn btn-blue" to={`${baseUrl}/`}>
                <span className="fa fa-home mr-2"></span> Home{' '}
            </Link>
        </div>
    </div>
);
