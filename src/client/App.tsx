import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import {} from './pages';
import { DataProvider } from './DataContext';
import { MainLayout, CleanLayout } from './layouts';
import '@client/i18n/config';

const App = () => {
    const baseUrl = import.meta.env.CLIENT_BASE_URL ?? '/app';
    const [env, setEnv] = useState<string | undefined>(undefined);

    useEffect(() => {
        setEnv(import.meta.env.CONFIG_NAME ?? '');
    }, []);

    return (
        <Router>
            <Routes>
                {/* Rutas públicas */}
                {/* <Route path={`${baseUrl}/signin`} element={<SignIn />} />
                <Route path={`${baseUrl}/signup`} element={<SignUp />} /> */}

                {/* Rutas protegidas 'CleanLayout' bajo DataProvider */}
                <Route
                    element={
                        <DataProvider>
                            <CleanLayout baseUrl={baseUrl}>
                                <Outlet />
                            </CleanLayout>
                        </DataProvider>
                    }
                >
                    {/* <Route path={`${baseUrl}/profile`} element={<Profile name="David" age={25} />} /> */}
                </Route>
                {/* Rutas protegidas 'MainLayout' bajo DataProvider */}
                <Route
                    element={
                        <DataProvider>
                            <MainLayout baseUrl={baseUrl}>
                                <Outlet />
                            </MainLayout>
                        </DataProvider>
                    }
                >
                    <Route path={`${baseUrl}/`} element={<Home />} />
                    {/* <Route path={`${baseUrl}/about`} element={<About />} /> */}
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
