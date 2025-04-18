import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ElementContextProvider } from './context/ElementContext';
import { AddableContextProvider } from './context/AddableContext';
import { AuthContextProvider } from './context/AuthContext';
import { PageContextProvider } from './context/PageContext';

createRoot(document.getElementById('root')).render(
    <AuthContextProvider>
        <ElementContextProvider>
            <AddableContextProvider>
                <PageContextProvider>
                    <App />
                </PageContextProvider>
            </AddableContextProvider>
        </ElementContextProvider>
    </AuthContextProvider>
);
