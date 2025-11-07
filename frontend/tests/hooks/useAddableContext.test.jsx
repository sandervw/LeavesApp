import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAddableContext from '../../src/hooks/useAddableContext';
import { AddableContextProvider } from '../../src/context/AddableContext';
import { mockAddable } from '../utils/mockData';

describe('useAddableContext hook', () => {
  describe('Context access', () => {
    it('should return addable context value when used within AddableContextProvider', () => {
      const wrapper = ({ children }) => (
        <AddableContextProvider>{children}</AddableContextProvider>
      );

      const { result } = renderHook(() => useAddableContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(typeof result.current.dispatch).toBe('function');
    });

    it('should return initial state with null addables', () => {
      const wrapper = ({ children }) => (
        <AddableContextProvider>{children}</AddableContextProvider>
      );

      const { result } = renderHook(() => useAddableContext(), { wrapper });

      expect(result.current.addables).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should throw error when used outside AddableContextProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        renderHook(() => useAddableContext());
      }).toThrow('useAddableContext must be used within an AddableContextProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Dispatch actions', () => {
    it('should set addables when SET_ADDABLES action is dispatched', () => {
      const wrapper = ({ children }) => (
        <AddableContextProvider>{children}</AddableContextProvider>
      );

      const { result } = renderHook(() => useAddableContext(), { wrapper });

      const addables = [
        mockAddable({ _id: 'addable1', name: 'Addable 1' }),
        mockAddable({ _id: 'addable2', name: 'Addable 2' }),
      ];

      act(() => {
        result.current.dispatch({ type: 'SET_ADDABLES', payload: addables });
      });

      expect(result.current.addables).toBeDefined();
      expect(result.current.addables.length).toBe(2);
      expect(result.current.addables[0]._id).toBe('addable1');
    });

    it('should update addable when UPDATE_ADDABLE action is dispatched', () => {
      const wrapper = ({ children }) => (
        <AddableContextProvider>{children}</AddableContextProvider>
      );

      const { result } = renderHook(() => useAddableContext(), { wrapper });

      // Set initial addables
      const addables = [
        mockAddable({ _id: 'addable1', name: 'Original Name' }),
        mockAddable({ _id: 'addable2', name: 'Addable 2' }),
      ];
      act(() => {
        result.current.dispatch({ type: 'SET_ADDABLES', payload: addables });
      });

      // Update the first addable
      const updatedAddable = { _id: 'addable1', name: 'Updated Name', text: 'New text' };
      act(() => {
        result.current.dispatch({ type: 'UPDATE_ADDABLE', payload: updatedAddable });
      });

      expect(result.current.addables[0].name).toBe('Updated Name');
      expect(result.current.addables[0].text).toBe('New text');
      // Second addable should remain unchanged
      expect(result.current.addables[1].name).toBe('Addable 2');
    });

    it('should handle UPDATE_ADDABLE for non-existent addable', () => {
      const wrapper = ({ children }) => (
        <AddableContextProvider>{children}</AddableContextProvider>
      );

      const { result } = renderHook(() => useAddableContext(), { wrapper });

      // Set initial addables
      const addables = [
        mockAddable({ _id: 'addable1', name: 'Addable 1' }),
      ];
      act(() => {
        result.current.dispatch({ type: 'SET_ADDABLES', payload: addables });
      });

      // Try to update non-existent addable
      const updatedAddable = { _id: 'nonexistent', name: 'Updated Name' };
      act(() => {
        result.current.dispatch({ type: 'UPDATE_ADDABLE', payload: updatedAddable });
      });

      // Should still have 1 addable with original data
      expect(result.current.addables.length).toBe(1);
      expect(result.current.addables[0]._id).toBe('addable1');
      expect(result.current.addables[0].name).toBe('Addable 1');
    });

    it('should handle multiple UPDATE_ADDABLE actions', () => {
      const wrapper = ({ children }) => (
        <AddableContextProvider>{children}</AddableContextProvider>
      );

      const { result } = renderHook(() => useAddableContext(), { wrapper });

      // Set initial addables
      const addables = [
        mockAddable({ _id: 'addable1', name: 'Addable 1', text: 'Text 1' }),
        mockAddable({ _id: 'addable2', name: 'Addable 2', text: 'Text 2' }),
      ];
      act(() => {
        result.current.dispatch({ type: 'SET_ADDABLES', payload: addables });
      });

      // Update first addable
      act(() => {
        result.current.dispatch({
          type: 'UPDATE_ADDABLE',
          payload: { _id: 'addable1', name: 'Updated 1', text: 'New Text 1' },
        });
      });

      // Update second addable
      act(() => {
        result.current.dispatch({
          type: 'UPDATE_ADDABLE',
          payload: { _id: 'addable2', name: 'Updated 2', text: 'New Text 2' },
        });
      });

      expect(result.current.addables[0].name).toBe('Updated 1');
      expect(result.current.addables[0].text).toBe('New Text 1');
      expect(result.current.addables[1].name).toBe('Updated 2');
      expect(result.current.addables[1].text).toBe('New Text 2');
    });

    it('should preserve addable properties not included in update payload', () => {
      const wrapper = ({ children }) => (
        <AddableContextProvider>{children}</AddableContextProvider>
      );

      const { result } = renderHook(() => useAddableContext(), { wrapper });

      // Set initial addable with multiple properties
      const addable = mockAddable({
        _id: 'addable1',
        name: 'Original',
        text: 'Original text',
        type: 'root',
        children: ['child1'],
      });
      act(() => {
        result.current.dispatch({ type: 'SET_ADDABLES', payload: [addable] });
      });

      // Update only the name
      act(() => {
        result.current.dispatch({
          type: 'UPDATE_ADDABLE',
          payload: { _id: 'addable1', name: 'Updated Name' },
        });
      });

      // Other properties should remain
      expect(result.current.addables[0].name).toBe('Updated Name');
      expect(result.current.addables[0].type).toBe('root');
      expect(result.current.addables[0].children).toEqual(['child1']);
    });
  });
});
