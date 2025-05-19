import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ElementContextProvider } from './context/ElementContext';
import { AddableContextProvider } from './context/AddableContext';
import { AuthContextProvider } from './context/AuthContext';
import { PageContextProvider } from './context/PageContext';
import { TreelistContextProvider } from './context/TreelistContext.jsx';

/**
 * App entry points; wraps all other components in global contexts.
 */
createRoot(document.getElementById('root')).render(
    <AuthContextProvider>
        <ElementContextProvider>
            <AddableContextProvider>
                <PageContextProvider>
                    <TreelistContextProvider>
                        <App />
                    </TreelistContextProvider>
                </PageContextProvider>
            </AddableContextProvider>
        </ElementContextProvider>
    </AuthContextProvider>
);
