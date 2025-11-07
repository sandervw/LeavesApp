import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useTreelistContext from '../../src/hooks/useTreelistContext';
import { TreelistContextProvider } from '../../src/context/TreelistContext';
import { mockTemplateList } from '../utils/mockData';

describe('useTreelistContext hook', () => {
  describe('Context access', () => {
    it('should return treelist context value when used within TreelistContextProvider', () => {
      const wrapper = ({ children }) => (
        <TreelistContextProvider>{children}</TreelistContextProvider>
      );

      const { result } = renderHook(() => useTreelistContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(typeof result.current.dispatch).toBe('function');
    });

    it('should return initial state with null trees', () => {
      const wrapper = ({ children }) => (
        <TreelistContextProvider>{children}</TreelistContextProvider>
      );

      const { result } = renderHook(() => useTreelistContext(), { wrapper });

      expect(result.current.trees).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should throw error when used outside TreelistContextProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTreelistContext());
      }).toThrow('useTreelistContext must be used within a TreelistContextProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Dispatch actions', () => {
    it('should set trees when SET_TREES action is dispatched', () => {
      const wrapper = ({ children }) => (
        <TreelistContextProvider>{children}</TreelistContextProvider>
      );

      const { result } = renderHook(() => useTreelistContext(), { wrapper });

      const trees = mockTemplateList(3);
      result.current.dispatch({ type: 'SET_TREES', payload: trees });

      expect(result.current.trees).toBeDefined();
      expect(result.current.trees.length).toBe(3);
      expect(result.current.trees[0]._id).toBe('template1');
    });

    it('should create tree when CREATE_TREE action is dispatched', () => {
      const wrapper = ({ children }) => (
        <TreelistContextProvider>{children}</TreelistContextProvider>
      );

      const { result } = renderHook(() => useTreelistContext(), { wrapper });

      // Set initial trees
      const initialTrees = mockTemplateList(2);
      result.current.dispatch({ type: 'SET_TREES', payload: initialTrees });

      expect(result.current.trees.length).toBe(2);

      // Create a new tree
      const newTree = { _id: 'template3', name: 'New Template' };
      result.current.dispatch({ type: 'CREATE_TREE', payload: newTree });

      expect(result.current.trees.length).toBe(3);
      expect(result.current.trees[2]._id).toBe('template3');
      expect(result.current.trees[2].name).toBe('New Template');
    });

    it('should delete tree when DELETE_TREE action is dispatched', () => {
      const wrapper = ({ children }) => (
        <TreelistContextProvider>{children}</TreelistContextProvider>
      );

      const { result } = renderHook(() => useTreelistContext(), { wrapper });

      // Set initial trees
      const trees = mockTemplateList(3);
      result.current.dispatch({ type: 'SET_TREES', payload: trees });

      expect(result.current.trees.length).toBe(3);

      // Delete a tree
      result.current.dispatch({ type: 'DELETE_TREE', payload: 'template2' });

      expect(result.current.trees.length).toBe(2);
      expect(result.current.trees.find(t => t._id === 'template2')).toBeUndefined();
    });

    it('should handle DELETE_TREE for non-existent tree gracefully', () => {
      const wrapper = ({ children }) => (
        <TreelistContextProvider>{children}</TreelistContextProvider>
      );

      const { result } = renderHook(() => useTreelistContext(), { wrapper });

      // Set initial trees
      const trees = mockTemplateList(2);
      result.current.dispatch({ type: 'SET_TREES', payload: trees });

      expect(result.current.trees.length).toBe(2);

      // Try to delete non-existent tree
      result.current.dispatch({ type: 'DELETE_TREE', payload: 'nonexistent' });

      // Should still have 2 trees
      expect(result.current.trees.length).toBe(2);
    });

    it('should handle multiple CREATE_TREE actions', () => {
      const wrapper = ({ children }) => (
        <TreelistContextProvider>{children}</TreelistContextProvider>
      );

      const { result } = renderHook(() => useTreelistContext(), { wrapper });

      // Initialize with empty array
      result.current.dispatch({ type: 'SET_TREES', payload: [] });

      // Create multiple trees
      result.current.dispatch({ type: 'CREATE_TREE', payload: { _id: 'tree1', name: 'Tree 1' } });
      result.current.dispatch({ type: 'CREATE_TREE', payload: { _id: 'tree2', name: 'Tree 2' } });
      result.current.dispatch({ type: 'CREATE_TREE', payload: { _id: 'tree3', name: 'Tree 3' } });

      expect(result.current.trees.length).toBe(3);
      expect(result.current.trees[0]._id).toBe('tree1');
      expect(result.current.trees[1]._id).toBe('tree2');
      expect(result.current.trees[2]._id).toBe('tree3');
    });
  });
});
