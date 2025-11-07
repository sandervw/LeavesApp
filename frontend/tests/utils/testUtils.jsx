import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from '../../src/context/AuthContext';
import { ElementContextProvider } from '../../src/context/ElementContext';
import { TreelistContextProvider } from '../../src/context/TreelistContext';
import { AddableContextProvider } from '../../src/context/AddableContext';
import { PageContext } from '../../src/context/PageContext';
import { DndContext } from '@dnd-kit/core';

/**
 * Custom render function that wraps components with all necessary providers
 * This ensures components have access to all context they need during testing
 *
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.providerProps - Props to pass to providers
 * @param {Object} options.providerProps.authState - Initial auth state
 * @param {Object} options.providerProps.elementState - Initial element state
 * @param {Object} options.providerProps.treelistState - Initial treelist state
 * @param {Object} options.providerProps.addableState - Initial addable state
 * @param {Object} options.providerProps.pageState - Initial page state
 * @param {boolean} options.withRouter - Whether to wrap with BrowserRouter (default: true)
 * @param {boolean} options.withDnd - Whether to wrap with DndContext (default: false)
 * @returns {Object} Render result from @testing-library/react
 */
function renderWithProviders(
  ui,
  {
    providerProps = {},
    withRouter = true,
    withDnd = false,
    ...renderOptions
  } = {}
) {
  const {
    authState,
    elementState,
    treelistState,
    addableState,
    pageState = { page: 'templates' },
  } = providerProps;

  // Wrapper component that provides all contexts
  function Wrapper({ children }) {
    let wrappedChildren = children;

    // Wrap with DndContext if needed
    if (withDnd) {
      wrappedChildren = (
        <DndContext>
          {wrappedChildren}
        </DndContext>
      );
    }

    // Wrap with all context providers
    wrappedChildren = (
      <AuthContextProvider initialState={authState}>
        <PageContext.Provider value={pageState}>
          <ElementContextProvider initialState={elementState}>
            <TreelistContextProvider initialState={treelistState}>
              <AddableContextProvider initialState={addableState}>
                {wrappedChildren}
              </AddableContextProvider>
            </TreelistContextProvider>
          </ElementContextProvider>
        </PageContext.Provider>
      </AuthContextProvider>
    );

    // Wrap with Router if needed
    if (withRouter) {
      wrappedChildren = <BrowserRouter>{wrappedChildren}</BrowserRouter>;
    }

    return wrappedChildren;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Custom render for components that only need Auth context
 */
function renderWithAuth(ui, { authState, ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthContextProvider initialState={authState}>
          {children}
        </AuthContextProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Custom render for components that need Element context
 */
function renderWithElement(ui, { elementState, ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <ElementContextProvider initialState={elementState}>
          {children}
        </ElementContextProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders, renderWithAuth, renderWithElement };
