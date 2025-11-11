import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useElementContext from '../../src/hooks/useElementContext';
import { ElementContextProvider } from '../../src/context/ElementContext';
import { mockTemplate, mockStorynode } from '../utils/mockData';

describe('useElementContext hook', () => {
  describe('Context access', () => {
    it('should return element context value when used within ElementContextProvider', () => {
      const wrapper = ({ children }) => (
        <ElementContextProvider>{children}</ElementContextProvider>
      );

      const { result } = renderHook(() => useElementContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(typeof result.current.dispatch).toBe('function');
    });

    it('should return initial state with null children and element', () => {
      const wrapper = ({ children }) => (
        <ElementContextProvider>{children}</ElementContextProvider>
      );

      const { result } = renderHook(() => useElementContext(), { wrapper });

      expect(result.current.children).toBeNull();
      expect(result.current.element).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should throw error when used outside ElementContextProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        renderHook(() => useElementContext());
      }).toThrow('useElementContext must be used within an ElementContextProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Dispatch actions', () => {
    it('should update element when SET_ELEMENT action is dispatched', () => {
      const wrapper = ({ children }) => (
        <ElementContextProvider>{children}</ElementContextProvider>
      );

      const { result } = renderHook(() => useElementContext(), { wrapper });

      const template = mockTemplate();
      act(() => {
        result.current.dispatch({ type: 'SET_ELEMENT', payload: template });
      });

      expect(result.current.element).toBeDefined();
      expect(result.current.element._id).toBe(template._id);
      expect(result.current.element.name).toBe(template.name);
    });

    it('should update children when SET_CHILDREN action is dispatched', () => {
      const wrapper = ({ children }) => (
        <ElementContextProvider>{children}</ElementContextProvider>
      );

      const { result } = renderHook(() => useElementContext(), { wrapper });

      const children = [mockTemplate({ _id: 'child1' }), mockTemplate({ _id: 'child2' })];
      act(() => {
        result.current.dispatch({ type: 'SET_CHILDREN', payload: children });
      });

      expect(result.current.children).toBeDefined();
      expect(result.current.children.length).toBe(2);
      expect(result.current.children[0]._id).toBe('child1');
    });

    it('should create child when CREATE_CHILD action is dispatched', () => {
      const wrapper = ({ children }) => (
        <ElementContextProvider>{children}</ElementContextProvider>
      );

      const { result } = renderHook(() => useElementContext(), { wrapper });

      // Set up initial state with parent element and empty children
      const parent = mockStorynode({ type: 'root', children: [], wordCount: 0 });
      act(() => {
        result.current.dispatch({ type: 'SET_ELEMENT', payload: parent });
        result.current.dispatch({ type: 'SET_CHILDREN', payload: [] });
      });

      // Create a child
      const child = mockStorynode({ _id: 'child1', wordCount: 100 });
      act(() => {
        result.current.dispatch({ type: 'CREATE_CHILD', payload: child });
      });

      expect(result.current.children.length).toBe(1);
      expect(result.current.children[0]._id).toBe('child1');
      expect(result.current.element.children.includes('child1')).toBe(true);
    });

    it('should update child when UPDATE_CHILD action is dispatched', () => {
      const wrapper = ({ children }) => (
        <ElementContextProvider>{children}</ElementContextProvider>
      );

      const { result } = renderHook(() => useElementContext(), { wrapper });

      // Set up initial children
      const child = mockStorynode({ _id: 'child1', name: 'Original Name', wordCount: 50 });
      act(() => {
        result.current.dispatch({ type: 'SET_CHILDREN', payload: [child] });
      });

      // Update the child
      const updatedChild = { ...child, name: 'Updated Name', wordCount: 100 };
      act(() => {
        result.current.dispatch({ type: 'UPDATE_CHILD', payload: updatedChild });
      });

      expect(result.current.children[0].name).toBe('Updated Name');
      expect(result.current.children[0].wordCount).toBe(100);
    });

    it('should delete child when DELETE_CHILD action is dispatched', () => {
      const wrapper = ({ children }) => (
        <ElementContextProvider>{children}</ElementContextProvider>
      );

      const { result } = renderHook(() => useElementContext(), { wrapper });

      // Set up initial state with parent and children
      const child1 = mockStorynode({ _id: 'child1', wordCount: 50 });
      const child2 = mockStorynode({ _id: 'child2', wordCount: 100 });
      const parent = mockStorynode({
        type: 'branch',
        children: ['child1', 'child2'],
        wordCount: 150,
      });

      act(() => {
        result.current.dispatch({ type: 'SET_ELEMENT', payload: parent });
        result.current.dispatch({ type: 'SET_CHILDREN', payload: [child1, child2] });
      });

      // Delete a child
      act(() => {
        result.current.dispatch({ type: 'DELETE_CHILD', payload: child1 });
      });

      expect(result.current.children.length).toBe(1);
      expect(result.current.children[0]._id).toBe('child2');
      expect(result.current.element.children.includes('child1')).toBe(false);
    });
  });
});
