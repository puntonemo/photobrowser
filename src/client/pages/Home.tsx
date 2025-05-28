import React from 'react';
import { useDataContext } from '../DataContext';
import { useTranslation, Trans } from 'react-i18next';
const Home: React.FC = () => {
    const { data, loading, error } = useDataContext();
    const { t } = useTranslation('translation');
    const count = 2;
    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!data)
        return (
            <>
                <h1>Anonymous Home Page</h1>
                <hr></hr>
                <p>{t('description.part1')}</p>
                <p>{t('description.part2')}</p>
                <Trans i18nKey="userMessagesUnread" count={count}>
                    You have {{ count }} unread message.
                </Trans>
            </>
        );
    return (
        <>
            <h1>Logged Home Page</h1>
            <hr></hr>
            <p>{t('title', { name: data.username })}</p>
            <p>{t('description.part1')}</p>
            <p>{t('description.part2')}</p>
            <p>{t('userMessagesUnread', { count: count })}</p>
        </>
    );
};

export default Home;
