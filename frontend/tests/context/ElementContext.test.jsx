import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ElementContextProvider } from '../../src/context/ElementContext';
import useElementContext from '../../src/hooks/useElementContext';
import { mockTemplate, mockStorynode } from '../utils/mockData';

// Test component that uses ElementContext
const TestComponent = () => {
  const { element, children, dispatch } = useElementContext();

  const handleSetElement = () => {
    const testElement = mockTemplate();
    dispatch({ type: 'SET_ELEMENT', payload: testElement });
  };

  const handleSetChildren = () => {
    const testChildren = [
      mockTemplate({ _id: 'child1', name: 'Child 1' }),
      mockTemplate({ _id: 'child2', name: 'Child 2' }),
    ];
    dispatch({ type: 'SET_CHILDREN', payload: testChildren });
  };

  const handleCreateChild = () => {
    const newChild = mockStorynode({ _id: 'newchild', name: 'New Child', wordCount: 100 });
    dispatch({ type: 'CREATE_CHILD', payload: newChild });
  };

  const handleUpdateChild = () => {
    dispatch({
      type: 'UPDATE_CHILD',
      payload: { _id: 'child1', name: 'Updated Child 1', wordCount: 200 },
    });
  };

  const handleDeleteChild = () => {
    dispatch({ type: 'DELETE_CHILD', payload: { _id: 'child1', wordCount: 100 } });
  };

  return (
    <div>
      <div data-testid="element-status">
        {element ? element.name : 'No element'}
      </div>
      <div data-testid="children-count">
        {children ? children.length : 0}
      </div>
      <button onClick={handleSetElement}>Set Element</button>
      <button onClick={handleSetChildren}>Set Children</button>
      <button onClick={handleCreateChild}>Create Child</button>
      <button onClick={handleUpdateChild}>Update Child</button>
      <button onClick={handleDeleteChild}>Delete Child</button>
    </div>
  );
};

describe('ElementContext', () => {
  describe('Initial state', () => {
    it('should initialize with null element and children', () => {
      render(
        <ElementContextProvider>
          <TestComponent />
        </ElementContextProvider>
      );

      expect(screen.getByTestId('element-status')).toHaveTextContent('No element');
      expect(screen.getByTestId('children-count')).toHaveTextContent('0');
    });
  });

  describe('SET_ELEMENT action', () => {
    it('should update element when SET_ELEMENT is dispatched', async () => {
      render(
        <ElementContextProvider>
          <TestComponent />
        </ElementContextProvider>
      );

      const button = screen.getByText('Set Element');
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('element-status')).toHaveTextContent('Test Template');
      });
    });

    it('should preserve children when setting element', async () => {
      render(
        <ElementContextProvider>
          <TestComponent />
        </ElementContextProvider>
      );

      // Set children first
      const setChildrenButton = screen.getByText('Set Children');
      setChildrenButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('children-count')).toHaveTextContent('2');
      });

      // Then set element
      const setElementButton = screen.getByText('Set Element');
      setElementButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('element-status')).toHaveTextContent('Test Template');
        expect(screen.getByTestId('children-count')).toHaveTextContent('2');
      });
    });
  });

  describe('SET_CHILDREN action', () => {
    it('should update children when SET_CHILDREN is dispatched', async () => {
      render(
        <ElementContextProvider>
          <TestComponent />
        </ElementContextProvider>
      );

      const button = screen.getByText('Set Children');
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('children-count')).toHaveTextContent('2');
      });
    });

    it('should preserve element when setting children', async () => {
      render(
        <ElementContextProvider>
          <TestComponent />
        </ElementContextProvider>
      );

      // Set element first
      const setElementButton = screen.getByText('Set Element');
      setElementButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('element-status')).toHaveTextContent('Test Template');
      });

      // Then set children
      const setChildrenButton = screen.getByText('Set Children');
      setChildrenButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('element-status')).toHaveTextContent('Test Template');
        expect(screen.getByTestId('children-count')).toHaveTextContent('2');
      });
    });
  });

  describe('CREATE_CHILD action', () => {
    it('should add child to children array', async () => {
      render(
        <ElementContextProvider>
          <TestComponent />
        </ElementContextProvider>
      );

      // Initialize with empty children array
      const setChildrenButton = screen.getByText('Set Children');
      setChildrenButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('children-count')).toHaveTextContent('2');
      });

      // Create a new child
      const createButton = screen.getByText('Create Child');
      createButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('children-count')).toHaveTextContent('3');
      });
    });

    it('should add child ID to element children array when element exists', async () => {
      const ElementChecker = () => {
        const { element, dispatch } = useElementContext();

        const setup = () => {
          const parent = mockStorynode({ type: 'root', children: [], wordCount: 0 });
          dispatch({ type: 'SET_ELEMENT', payload: parent });
          dispatch({ type: 'SET_CHILDREN', payload: [] });
        };

        const createChild = () => {
          const child = mockStorynode({ _id: 'newchild', wordCount: 100 });
          dispatch({ type: 'CREATE_CHILD', payload: child });
        };

        return (
          <div>
            <div data-testid="element-children">
              {element && element.children ? element.children.join(',') : 'none'}
            </div>
            <button onClick={setup}>Setup</button>
            <button onClick={createChild}>Create</button>
          </div>
        );
      };

      render(
        <ElementContextProvider>
          <ElementChecker />
        </ElementContextProvider>
      );

      screen.getByText('Setup').click();
      await waitFor(() => {
        expect(screen.getByTestId('element-children')).toHaveTextContent('none');
      });

      screen.getByText('Create').click();
      await waitFor(() => {
        expect(screen.getByTestId('element-children')).toHaveTextContent('newchild');
      });
    });
  });

  describe('UPDATE_CHILD action', () => {
    it('should update existing child in children array', async () => {
      const ChildUpdater = () => {
        const { children, dispatch } = useElementContext();

        const setup = () => {
          const testChildren = [
            mockStorynode({ _id: 'child1', name: 'Original', wordCount: 100 }),
          ];
          dispatch({ type: 'SET_CHILDREN', payload: testChildren });
        };

        const update = () => {
          dispatch({
            type: 'UPDATE_CHILD',
            payload: { _id: 'child1', name: 'Updated', wordCount: 200 },
          });
        };

        return (
          <div>
            <div data-testid="child-name">
              {children && children[0] ? children[0].name : 'none'}
            </div>
            <button onClick={setup}>Setup</button>
            <button onClick={update}>Update</button>
          </div>
        );
      };

      render(
        <ElementContextProvider>
          <ChildUpdater />
        </ElementContextProvider>
      );

      screen.getByText('Setup').click();
      await waitFor(() => {
        expect(screen.getByTestId('child-name')).toHaveTextContent('Original');
      });

      screen.getByText('Update').click();
      await waitFor(() => {
        expect(screen.getByTestId('child-name')).toHaveTextContent('Updated');
      });
    });
  });

  describe('DELETE_CHILD action', () => {
    it('should remove child from children array', async () => {
      const ChildDeleter = () => {
        const { children, dispatch } = useElementContext();

        const setup = () => {
          const testChildren = [
            mockStorynode({ _id: 'child1', wordCount: 100 }),
            mockStorynode({ _id: 'child2', wordCount: 50 }),
          ];
          dispatch({ type: 'SET_CHILDREN', payload: testChildren });
        };

        const deleteChild = () => {
          dispatch({ type: 'DELETE_CHILD', payload: { _id: 'child1', wordCount: 100 } });
        };

        return (
          <div>
            <div data-testid="children-count">{children ? children.length : 0}</div>
            <button onClick={setup}>Setup</button>
            <button onClick={deleteChild}>Delete</button>
          </div>
        );
      };

      render(
        <ElementContextProvider>
          <ChildDeleter />
        </ElementContextProvider>
      );

      screen.getByText('Setup').click();
      await waitFor(() => {
        expect(screen.getByTestId('children-count')).toHaveTextContent('2');
      });

      screen.getByText('Delete').click();
      await waitFor(() => {
        expect(screen.getByTestId('children-count')).toHaveTextContent('1');
      });
    });
  });

  describe('Context value propagation', () => {
    it('should propagate state to multiple consumers', async () => {
      const Consumer1 = () => {
        const { element } = useElementContext();
        return <div data-testid="consumer1">{element ? element.name : 'none'}</div>;
      };

      const Consumer2 = () => {
        const { element } = useElementContext();
        return <div data-testid="consumer2">{element ? element.name : 'none'}</div>;
      };

      render(
        <ElementContextProvider>
          <Consumer1 />
          <Consumer2 />
          <TestComponent />
        </ElementContextProvider>
      );

      screen.getByText('Set Element').click();

      await waitFor(() => {
        expect(screen.getByTestId('consumer1')).toHaveTextContent('Test Template');
        expect(screen.getByTestId('consumer2')).toHaveTextContent('Test Template');
      });
    });
  });
});
