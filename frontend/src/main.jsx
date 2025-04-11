import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ElementContextProvider } from './context/ElementContext';
import { AddableContextProvider } from './context/AddableContext';
import { AuthContextProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
    <AuthContextProvider>
        <ElementContextProvider>
            <AddableContextProvider>
                <App />
            </AddableContextProvider>
        </ElementContextProvider>
    </AuthContextProvider>
);
