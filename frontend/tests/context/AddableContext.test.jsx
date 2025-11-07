import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AddableContextProvider } from '../../src/context/AddableContext';
import useAddableContext from '../../src/hooks/useAddableContext';
import { mockAddable } from '../utils/mockData';

// Test component that uses AddableContext
const TestComponent = () => {
  const { addables, dispatch } = useAddableContext();

  const handleSetAddables = () => {
    const testAddables = [
      mockAddable({ _id: 'addable1', name: 'Addable 1' }),
      mockAddable({ _id: 'addable2', name: 'Addable 2' }),
      mockAddable({ _id: 'addable3', name: 'Addable 3' }),
    ];
    dispatch({ type: 'SET_ADDABLES', payload: testAddables });
  };

  const handleUpdateAddable = () => {
    dispatch({
      type: 'UPDATE_ADDABLE',
      payload: { _id: 'addable1', name: 'Updated Addable 1', text: 'New text' },
    });
  };

  return (
    <div>
      <div data-testid="addables-count">
        {addables ? addables.length : 0}
      </div>
      {addables && addables.map(addable => (
        <div key={addable._id} data-testid={`addable-${addable._id}`}>
          {addable.name}
        </div>
      ))}
      <button onClick={handleSetAddables}>Set Addables</button>
      <button onClick={handleUpdateAddable}>Update Addable</button>
    </div>
  );
};

describe('AddableContext', () => {
  describe('Initial state', () => {
    it('should initialize with null addables', () => {
      render(
        <AddableContextProvider>
          <TestComponent />
        </AddableContextProvider>
      );

      expect(screen.getByTestId('addables-count')).toHaveTextContent('0');
    });
  });

  describe('SET_ADDABLES action', () => {
    it('should set addables when SET_ADDABLES is dispatched', async () => {
      render(
        <AddableContextProvider>
          <TestComponent />
        </AddableContextProvider>
      );

      const button = screen.getByText('Set Addables');
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('addables-count')).toHaveTextContent('3');
      });
    });

    it('should render all addables in the list', async () => {
      render(
        <AddableContextProvider>
          <TestComponent />
        </AddableContextProvider>
      );

      const button = screen.getByText('Set Addables');
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('addable-addable1')).toHaveTextContent('Addable 1');
        expect(screen.getByTestId('addable-addable2')).toHaveTextContent('Addable 2');
        expect(screen.getByTestId('addable-addable3')).toHaveTextContent('Addable 3');
      });
    });

    it('should replace existing addables when SET_ADDABLES is called again', async () => {
      const AddableSetter = () => {
        const { addables, dispatch } = useAddableContext();

        const setFirst = () => {
          dispatch({
            type: 'SET_ADDABLES',
            payload: [mockAddable({ _id: 'first', name: 'First Set' })],
          });
        };

        const setSecond = () => {
          dispatch({
            type: 'SET_ADDABLES',
            payload: [mockAddable({ _id: 'second', name: 'Second Set' })],
          });
        };

        return (
          <div>
            <div data-testid="count">{addables ? addables.length : 0}</div>
            {addables && addables.map(a => (
              <div key={a._id} data-testid={a._id}>{a.name}</div>
            ))}
            <button onClick={setFirst}>First</button>
            <button onClick={setSecond}>Second</button>
          </div>
        );
      };

      render(
        <AddableContextProvider>
          <AddableSetter />
        </AddableContextProvider>
      );

      screen.getByText('First').click();
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
        expect(screen.getByTestId('first')).toBeInTheDocument();
      });

      screen.getByText('Second').click();
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
        expect(screen.getByTestId('second')).toBeInTheDocument();
        expect(screen.queryByTestId('first')).not.toBeInTheDocument();
      });
    });
  });

  describe('UPDATE_ADDABLE action', () => {
    it('should update addable in the list', async () => {
      render(
        <AddableContextProvider>
          <TestComponent />
        </AddableContextProvider>
      );

      // Set initial addables
      screen.getByText('Set Addables').click();
      await waitFor(() => {
        expect(screen.getByTestId('addable-addable1')).toHaveTextContent('Addable 1');
      });

      // Update addable
      screen.getByText('Update Addable').click();
      await waitFor(() => {
        expect(screen.getByTestId('addable-addable1')).toHaveTextContent('Updated Addable 1');
      });
    });

    it('should only update the specified addable', async () => {
      render(
        <AddableContextProvider>
          <TestComponent />
        </AddableContextProvider>
      );

      // Set initial addables
      screen.getByText('Set Addables').click();
      await waitFor(() => {
        expect(screen.getByTestId('addable-addable1')).toHaveTextContent('Addable 1');
        expect(screen.getByTestId('addable-addable2')).toHaveTextContent('Addable 2');
        expect(screen.getByTestId('addable-addable3')).toHaveTextContent('Addable 3');
      });

      // Update only addable1
      screen.getByText('Update Addable').click();
      await waitFor(() => {
        expect(screen.getByTestId('addable-addable1')).toHaveTextContent('Updated Addable 1');
        expect(screen.getByTestId('addable-addable2')).toHaveTextContent('Addable 2');
        expect(screen.getByTestId('addable-addable3')).toHaveTextContent('Addable 3');
      });
    });

    it('should preserve addable properties not in update payload', async () => {
      const AddableUpdater = () => {
        const { addables, dispatch } = useAddableContext();

        const setup = () => {
          dispatch({
            type: 'SET_ADDABLES',
            payload: [
              mockAddable({
                _id: 'test',
                name: 'Original',
                text: 'Original text',
                type: 'root',
              }),
            ],
          });
        };

        const update = () => {
          dispatch({
            type: 'UPDATE_ADDABLE',
            payload: { _id: 'test', name: 'Updated' },
          });
        };

        return (
          <div>
            {addables && addables[0] && (
              <div>
                <div data-testid="name">{addables[0].name}</div>
                <div data-testid="type">{addables[0].type}</div>
              </div>
            )}
            <button onClick={setup}>Setup</button>
            <button onClick={update}>Update</button>
          </div>
        );
      };

      render(
        <AddableContextProvider>
          <AddableUpdater />
        </AddableContextProvider>
      );

      screen.getByText('Setup').click();
      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveTextContent('Original');
        expect(screen.getByTestId('type')).toHaveTextContent('root');
      });

      screen.getByText('Update').click();
      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveTextContent('Updated');
        expect(screen.getByTestId('type')).toHaveTextContent('root'); // Should be preserved
      });
    });

    it('should handle updating non-existent addable gracefully', async () => {
      const AddableUpdater = () => {
        const { addables, dispatch } = useAddableContext();

        const setup = () => {
          dispatch({
            type: 'SET_ADDABLES',
            payload: [mockAddable({ _id: 'exists', name: 'Exists' })],
          });
        };

        const updateNonexistent = () => {
          dispatch({
            type: 'UPDATE_ADDABLE',
            payload: { _id: 'nonexistent', name: 'Should Not Appear' },
          });
        };

        return (
          <div>
            <div data-testid="count">{addables ? addables.length : 0}</div>
            {addables && addables.map(a => (
              <div key={a._id} data-testid={a._id}>{a.name}</div>
            ))}
            <button onClick={setup}>Setup</button>
            <button onClick={updateNonexistent}>Update</button>
          </div>
        );
      };

      render(
        <AddableContextProvider>
          <AddableUpdater />
        </AddableContextProvider>
      );

      screen.getByText('Setup').click();
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
        expect(screen.getByTestId('exists')).toHaveTextContent('Exists');
      });

      screen.getByText('Update').click();
      await waitFor(() => {
        // Should still have 1 addable with original data
        expect(screen.getByTestId('count')).toHaveTextContent('1');
        expect(screen.getByTestId('exists')).toHaveTextContent('Exists');
      });
    });

    it('should handle multiple updates to same addable', async () => {
      const MultiUpdater = () => {
        const { addables, dispatch } = useAddableContext();

        const setup = () => {
          dispatch({
            type: 'SET_ADDABLES',
            payload: [mockAddable({ _id: 'test', name: 'Original', text: '' })],
          });
        };

        const updateName = () => {
          dispatch({
            type: 'UPDATE_ADDABLE',
            payload: { _id: 'test', name: 'Updated Name' },
          });
        };

        const updateText = () => {
          dispatch({
            type: 'UPDATE_ADDABLE',
            payload: { _id: 'test', text: 'Updated Text' },
          });
        };

        return (
          <div>
            {addables && addables[0] && (
              <div>
                <div data-testid="name">{addables[0].name}</div>
                <div data-testid="text">{addables[0].text || 'empty'}</div>
              </div>
            )}
            <button onClick={setup}>Setup</button>
            <button onClick={updateName}>Update Name</button>
            <button onClick={updateText}>Update Text</button>
          </div>
        );
      };

      render(
        <AddableContextProvider>
          <MultiUpdater />
        </AddableContextProvider>
      );

      screen.getByText('Setup').click();
      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveTextContent('Original');
        expect(screen.getByTestId('text')).toHaveTextContent('empty');
      });

      screen.getByText('Update Name').click();
      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveTextContent('Updated Name');
        expect(screen.getByTestId('text')).toHaveTextContent('empty');
      });

      screen.getByText('Update Text').click();
      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveTextContent('Updated Name');
        expect(screen.getByTestId('text')).toHaveTextContent('Updated Text');
      });
    });
  });

  describe('Context value propagation', () => {
    it('should propagate state to multiple consumers', async () => {
      const Consumer1 = () => {
        const { addables } = useAddableContext();
        return <div data-testid="consumer1">{addables ? addables.length : 0}</div>;
      };

      const Consumer2 = () => {
        const { addables } = useAddableContext();
        return <div data-testid="consumer2">{addables ? addables.length : 0}</div>;
      };

      render(
        <AddableContextProvider>
          <Consumer1 />
          <Consumer2 />
          <TestComponent />
        </AddableContextProvider>
      );

      screen.getByText('Set Addables').click();

      await waitFor(() => {
        expect(screen.getByTestId('consumer1')).toHaveTextContent('3');
        expect(screen.getByTestId('consumer2')).toHaveTextContent('3');
      });
    });

    it('should update all consumers when addables change', async () => {
      const Consumer = () => {
        const { addables } = useAddableContext();
        return (
          <div data-testid="consumer">
            {addables && addables[0] ? addables[0].name : 'none'}
          </div>
        );
      };

      render(
        <AddableContextProvider>
          <Consumer />
          <TestComponent />
        </AddableContextProvider>
      );

      screen.getByText('Set Addables').click();
      await waitFor(() => {
        expect(screen.getByTestId('consumer')).toHaveTextContent('Addable 1');
      });

      screen.getByText('Update Addable').click();
      await waitFor(() => {
        expect(screen.getByTestId('consumer')).toHaveTextContent('Updated Addable 1');
      });
    });
  });
});
