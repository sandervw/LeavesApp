import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TreelistContextProvider } from '../../src/context/TreelistContext';
import useTreelistContext from '../../src/hooks/useTreelistContext';
import { mockTemplateList } from '../utils/mockData';

// Test component that uses TreelistContext
const TestComponent = () => {
  const { trees, dispatch } = useTreelistContext();

  const handleSetTrees = () => {
    const testTrees = mockTemplateList(3);
    dispatch({ type: 'SET_TREES', payload: testTrees });
  };

  const handleCreateTree = () => {
    const newTree = { _id: 'newtree', name: 'New Tree' };
    dispatch({ type: 'CREATE_TREE', payload: newTree });
  };

  const handleDeleteTree = () => {
    dispatch({ type: 'DELETE_TREE', payload: 'template1' });
  };

  return (
    <div>
      <div data-testid="trees-count">
        {trees ? trees.length : 0}
      </div>
      {trees && trees.map(tree => (
        <div key={tree._id} data-testid={`tree-${tree._id}`}>
          {tree.name}
        </div>
      ))}
      <button onClick={handleSetTrees}>Set Trees</button>
      <button onClick={handleCreateTree}>Create Tree</button>
      <button onClick={handleDeleteTree}>Delete Tree</button>
    </div>
  );
};

describe('TreelistContext', () => {
  describe('Initial state', () => {
    it('should initialize with null trees', () => {
      render(
        <TreelistContextProvider>
          <TestComponent />
        </TreelistContextProvider>
      );

      expect(screen.getByTestId('trees-count')).toHaveTextContent('0');
    });
  });

  describe('SET_TREES action', () => {
    it('should set trees when SET_TREES is dispatched', async () => {
      render(
        <TreelistContextProvider>
          <TestComponent />
        </TreelistContextProvider>
      );

      const button = screen.getByText('Set Trees');
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('trees-count')).toHaveTextContent('3');
      });
    });

    it('should render all trees in the list', async () => {
      render(
        <TreelistContextProvider>
          <TestComponent />
        </TreelistContextProvider>
      );

      const button = screen.getByText('Set Trees');
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('tree-template1')).toHaveTextContent('Template 1');
        expect(screen.getByTestId('tree-template2')).toHaveTextContent('Template 2');
        expect(screen.getByTestId('tree-template3')).toHaveTextContent('Template 3');
      });
    });

    it('should replace existing trees when SET_TREES is called again', async () => {
      const TreeSetter = () => {
        const { trees, dispatch } = useTreelistContext();

        const setFirst = () => {
          dispatch({ type: 'SET_TREES', payload: [{ _id: 'tree1', name: 'First Set' }] });
        };

        const setSecond = () => {
          dispatch({ type: 'SET_TREES', payload: [{ _id: 'tree2', name: 'Second Set' }] });
        };

        return (
          <div>
            <div data-testid="trees-count">{trees ? trees.length : 0}</div>
            {trees && trees.map(t => (
              <div key={t._id} data-testid={t._id}>{t.name}</div>
            ))}
            <button onClick={setFirst}>First</button>
            <button onClick={setSecond}>Second</button>
          </div>
        );
      };

      render(
        <TreelistContextProvider>
          <TreeSetter />
        </TreelistContextProvider>
      );

      screen.getByText('First').click();
      await waitFor(() => {
        expect(screen.getByTestId('trees-count')).toHaveTextContent('1');
        expect(screen.getByTestId('tree1')).toBeInTheDocument();
      });

      screen.getByText('Second').click();
      await waitFor(() => {
        expect(screen.getByTestId('trees-count')).toHaveTextContent('1');
        expect(screen.getByTestId('tree2')).toBeInTheDocument();
        expect(screen.queryByTestId('tree1')).not.toBeInTheDocument();
      });
    });
  });

  describe('CREATE_TREE action', () => {
    it('should add tree to the list', async () => {
      render(
        <TreelistContextProvider>
          <TestComponent />
        </TreelistContextProvider>
      );

      // Set initial trees
      screen.getByText('Set Trees').click();
      await waitFor(() => {
        expect(screen.getByTestId('trees-count')).toHaveTextContent('3');
      });

      // Create new tree
      screen.getByText('Create Tree').click();
      await waitFor(() => {
        expect(screen.getByTestId('trees-count')).toHaveTextContent('4');
      });
    });

    it('should append new tree to end of list', async () => {
      render(
        <TreelistContextProvider>
          <TestComponent />
        </TreelistContextProvider>
      );

      // Set initial trees
      screen.getByText('Set Trees').click();
      await waitFor(() => {
        expect(screen.getByTestId('trees-count')).toHaveTextContent('3');
      });

      // Create new tree
      screen.getByText('Create Tree').click();
      await waitFor(() => {
        expect(screen.getByTestId('tree-newtree')).toHaveTextContent('New Tree');
      });
    });

    it('should create tree even when list is empty', async () => {
      const EmptyListCreator = () => {
        const { trees, dispatch } = useTreelistContext();

        const initialize = () => {
          dispatch({ type: 'SET_TREES', payload: [] });
        };

        const create = () => {
          dispatch({ type: 'CREATE_TREE', payload: { _id: 'first', name: 'First Tree' } });
        };

        return (
          <div>
            <div data-testid="count">{trees ? trees.length : 0}</div>
            <button onClick={initialize}>Initialize</button>
            <button onClick={create}>Create</button>
          </div>
        );
      };

      render(
        <TreelistContextProvider>
          <EmptyListCreator />
        </TreelistContextProvider>
      );

      screen.getByText('Initialize').click();
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('0');
      });

      screen.getByText('Create').click();
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });
    });
  });

  describe('DELETE_TREE action', () => {
    it('should remove tree from the list', async () => {
      render(
        <TreelistContextProvider>
          <TestComponent />
        </TreelistContextProvider>
      );

      // Set initial trees
      screen.getByText('Set Trees').click();
      await waitFor(() => {
        expect(screen.getByTestId('trees-count')).toHaveTextContent('3');
      });

      // Delete a tree
      screen.getByText('Delete Tree').click();
      await waitFor(() => {
        expect(screen.getByTestId('trees-count')).toHaveTextContent('2');
      });
    });

    it('should remove correct tree by ID', async () => {
      render(
        <TreelistContextProvider>
          <TestComponent />
        </TreelistContextProvider>
      );

      // Set initial trees
      screen.getByText('Set Trees').click();
      await waitFor(() => {
        expect(screen.getByTestId('tree-template1')).toBeInTheDocument();
        expect(screen.getByTestId('tree-template2')).toBeInTheDocument();
        expect(screen.getByTestId('tree-template3')).toBeInTheDocument();
      });

      // Delete template1
      screen.getByText('Delete Tree').click();
      await waitFor(() => {
        expect(screen.queryByTestId('tree-template1')).not.toBeInTheDocument();
        expect(screen.getByTestId('tree-template2')).toBeInTheDocument();
        expect(screen.getByTestId('tree-template3')).toBeInTheDocument();
      });
    });

    it('should handle deleting non-existent tree gracefully', async () => {
      const TreeDeleter = () => {
        const { trees, dispatch } = useTreelistContext();

        const setup = () => {
          dispatch({ type: 'SET_TREES', payload: [{ _id: 'tree1', name: 'Tree 1' }] });
        };

        const deleteNonexistent = () => {
          dispatch({ type: 'DELETE_TREE', payload: 'nonexistent' });
        };

        return (
          <div>
            <div data-testid="count">{trees ? trees.length : 0}</div>
            <button onClick={setup}>Setup</button>
            <button onClick={deleteNonexistent}>Delete</button>
          </div>
        );
      };

      render(
        <TreelistContextProvider>
          <TreeDeleter />
        </TreelistContextProvider>
      );

      screen.getByText('Setup').click();
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });

      screen.getByText('Delete').click();
      await waitFor(() => {
        // Should still have 1 tree
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });
    });
  });

  describe('Context value propagation', () => {
    it('should propagate state to multiple consumers', async () => {
      const Consumer1 = () => {
        const { trees } = useTreelistContext();
        return <div data-testid="consumer1">{trees ? trees.length : 0}</div>;
      };

      const Consumer2 = () => {
        const { trees } = useTreelistContext();
        return <div data-testid="consumer2">{trees ? trees.length : 0}</div>;
      };

      render(
        <TreelistContextProvider>
          <Consumer1 />
          <Consumer2 />
          <TestComponent />
        </TreelistContextProvider>
      );

      screen.getByText('Set Trees').click();

      await waitFor(() => {
        expect(screen.getByTestId('consumer1')).toHaveTextContent('3');
        expect(screen.getByTestId('consumer2')).toHaveTextContent('3');
      });
    });

    it('should update all consumers when trees change', async () => {
      const Consumer = () => {
        const { trees } = useTreelistContext();
        return (
          <div data-testid="consumer">
            {trees && trees.map(t => t.name).join(', ')}
          </div>
        );
      };

      render(
        <TreelistContextProvider>
          <Consumer />
          <TestComponent />
        </TreelistContextProvider>
      );

      screen.getByText('Set Trees').click();
      await waitFor(() => {
        expect(screen.getByTestId('consumer')).toHaveTextContent('Template 1, Template 2, Template 3');
      });

      screen.getByText('Create Tree').click();
      await waitFor(() => {
        expect(screen.getByTestId('consumer')).toHaveTextContent('Template 1, Template 2, Template 3, New Tree');
      });
    });
  });
});
