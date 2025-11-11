import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthContextProvider } from '../../src/context/AuthContext';
import useAuthContext from '../../src/hooks/useAuthContext';
import { mockUser } from '../utils/mockData';

// Test component that uses AuthContext
const TestComponent = () => {
  const { user, dispatch } = useAuthContext();

  const handleLogin = () => {
    const testUser = mockUser();
    dispatch({ type: 'LOGIN', payload: testUser });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initial state', () => {
    it('should initialize with no user when localStorage is empty', () => {
      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });

    it('should initialize with user from localStorage', () => {
      const user = mockUser();
      localStorage.setItem('user', JSON.stringify(user));

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      expect(screen.getByTestId('user-status')).toHaveTextContent(`Logged in as ${user.email}`);
    });
  });

  describe('LOGIN action', () => {
    it('should update state when user logs in', async () => {
      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');
      });
    });

    it('should save user to localStorage on login', async () => {
      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        expect(storedUser).toBeDefined();
        expect(storedUser.email).toBe('test@example.com');
      });
    });
  });

  describe('LOGOUT action', () => {
    it('should clear user state on logout', async () => {
      const user = mockUser();
      localStorage.setItem('user', JSON.stringify(user));

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');

      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });

    it('should remove user from localStorage on logout', async () => {
      const user = mockUser();
      localStorage.setItem('user', JSON.stringify(user));

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      await waitFor(() => {
        const storedUser = localStorage.getItem('user');
        expect(storedUser).toBeNull();
      });
    });
  });

  describe('userUpdated event', () => {
    it('should update context when userUpdated event is dispatched with user', async () => {
      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');

      // Simulate userUpdated event (as done by apiClient interceptor)
      const user = mockUser();
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');
      });
    });

    it('should clear context when userUpdated event is dispatched with null', async () => {
      const user = mockUser();
      localStorage.setItem('user', JSON.stringify(user));

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');

      // Simulate userUpdated event with null (as done by apiClient on auth failure)
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: null }));

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
      });
    });
  });

  describe('Context value propagation', () => {
    it('should provide user and dispatch to all consumers', () => {
      const TestConsumer = () => {
        const context = useAuthContext();
        return (
          <div>
            <div data-testid="has-user">{context.user ? 'yes' : 'no'}</div>
            <div data-testid="has-dispatch">{context.dispatch ? 'yes' : 'no'}</div>
          </div>
        );
      };

      render(
        <AuthContextProvider>
          <TestConsumer />
        </AuthContextProvider>
      );

      expect(screen.getByTestId('has-user')).toHaveTextContent('no');
      expect(screen.getByTestId('has-dispatch')).toHaveTextContent('yes');
    });

    it('should propagate state changes to multiple consumers', async () => {
      const Consumer1 = () => {
        const { user } = useAuthContext();
        return <div data-testid="consumer1">{user ? user.email : 'none'}</div>;
      };

      const Consumer2 = () => {
        const { user } = useAuthContext();
        return <div data-testid="consumer2">{user ? user.email : 'none'}</div>;
      };

      render(
        <AuthContextProvider>
          <Consumer1 />
          <Consumer2 />
          <TestComponent />
        </AuthContextProvider>
      );

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('consumer1')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('consumer2')).toHaveTextContent('test@example.com');
      });
    });
  });
});
