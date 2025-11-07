import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../src/components/overlay/Login';
import { AuthContextProvider } from '../../../src/context/AuthContext';
import { renderWithProviders } from '../../utils/testUtils';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login component', () => {
  const mockHideModal = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockHideModal.mockClear();
  });

  describe('Rendering', () => {
    it('should render login form with all fields', () => {
      renderWithProviders(<Login hideModal={mockHideModal} />);

      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByText('Log In')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      renderWithProviders(<Login hideModal={mockHideModal} />);

      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('should allow user to type in email field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow user to type in password field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const passwordInput = screen.getByPlaceholderText('Password');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should call hideModal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockHideModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form validation', () => {
    it('should require email field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      expect(emailInput).toBeRequired();
    });

    it('should require password field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput).toBeRequired();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Successful login', () => {
    it('should submit form with valid credentials', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Log In');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Log In');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Loading should appear briefly
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should save user to localStorage on successful login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Log In');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        const storedUser = localStorage.getItem('user');
        expect(storedUser).toBeDefined();
        const parsedUser = JSON.parse(storedUser);
        expect(parsedUser.email).toBe('test@example.com');
      });
    });
  });

  describe('Failed login', () => {
    it('should show error message on invalid credentials', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Log In');

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });
    });

    it('should not navigate on failed login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Log In');

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle server errors gracefully', async () => {
      // Override handler to simulate server error
      server.use(
        http.post('http://localhost:8080/auth/login', () => {
          return HttpResponse.json(
            { message: 'Server error', errorCode: 'InternalError' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Log In');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading state', () => {
    it('should clear loading state after successful login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Log In');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });

      // Loading should be gone
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should clear loading state after failed login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Log In');

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });

      // Loading should be gone
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
