import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DataType = {
    id: number;
    email: string;
    time: string;
    username: string;
};
type DataContextType = {
    data: DataType | null | undefined;
    loading: boolean;
    error: string | null;
    setData: (data: DataType | null) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useDataContext debe usarse dentro de un DataProvider');
    }
    return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<DataType | null | undefined>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/auth/profile').catch((error) => {
                    setError((error as Error).message);
                });
                setLoading(false);
                if (response) {
                    if (response.ok === true) {
                        const result = await response.json();
                        setData(result);
                    } else {
                        setData(undefined);
                    }
                }
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return <DataContext.Provider value={{ data, loading, error, setData }}>{children}</DataContext.Provider>;
};
