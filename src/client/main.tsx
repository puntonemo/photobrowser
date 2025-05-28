import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
// const container = document.body;
if (!container) throw new Error('Elemento #root no encontrado');

const initialProps = (window as any).__INITIAL_DATA__ ?? {};

if (container.hasChildNodes()) {
    hydrateRoot(container, <App {...initialProps} />);
} else {
    createRoot(container).render(<App {...initialProps} />);
}
