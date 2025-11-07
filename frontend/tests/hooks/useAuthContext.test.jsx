import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAuthContext from '../../src/hooks/useAuthContext';
import { AuthContextProvider } from '../../src/context/AuthContext';
import { mockUser } from '../utils/mockData';

describe('useAuthContext hook', () => {
  describe('Context access', () => {
    it('should return auth context value when used within AuthContextProvider', () => {
      const wrapper = ({ children }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(typeof result.current.dispatch).toBe('function');
    });

    it('should return user from context when user is logged in', () => {
      // Setup localStorage with user
      const user = mockUser();
      localStorage.setItem('user', JSON.stringify(user));

      const wrapper = ({ children }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      expect(result.current.user).toBeDefined();
      expect(result.current.user.email).toBe(user.email);
    });

    it('should return null user when not logged in', () => {
      // Clear localStorage
      localStorage.clear();

      const wrapper = ({ children }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      expect(result.current.user).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should throw error when used outside AuthContextProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        renderHook(() => useAuthContext());
      }).toThrow('useAuthContext must be used within a AuthContextProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Dispatch function', () => {
    it('should provide dispatch function from context', () => {
      const wrapper = ({ children }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      expect(result.current.dispatch).toBeDefined();
      expect(typeof result.current.dispatch).toBe('function');
    });

    it('should have access to dispatch for LOGIN action', () => {
      const wrapper = ({ children }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      const user = mockUser();
      act(() => {
        result.current.dispatch({ type: 'LOGIN', payload: user });
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.user.email).toBe(user.email);
    });

    it('should have access to dispatch for LOGOUT action', () => {
      // Setup localStorage with user
      const user = mockUser();
      localStorage.setItem('user', JSON.stringify(user));

      const wrapper = ({ children }) => (
        <AuthContextProvider>{children}</AuthContextProvider>
      );

      const { result } = renderHook(() => useAuthContext(), { wrapper });

      expect(result.current.user).toBeDefined();

      act(() => {
        result.current.dispatch({ type: 'LOGOUT' });
      });

      expect(result.current.user).toBeNull();
    });
  });
});
