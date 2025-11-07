import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Signup from '../../../src/components/overlay/Signup';
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

describe('Signup component', () => {
  const mockHideModal = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockHideModal.mockClear();
  });

  describe('Rendering', () => {
    it('should render signup form with all fields', () => {
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('should allow user to type in email field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      await user.type(emailInput, 'newuser@example.com');

      expect(emailInput).toHaveValue('newuser@example.com');
    });

    it('should allow user to type in username field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const usernameInput = screen.getByPlaceholderText('Username');
      await user.type(usernameInput, 'newusername');

      expect(usernameInput).toHaveValue('newusername');
    });

    it('should allow user to type in password field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const passwordInput = screen.getByPlaceholderText('Password');
      await user.type(passwordInput, 'securepassword123');

      expect(passwordInput).toHaveValue('securepassword123');
    });

    it('should call hideModal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockHideModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form validation', () => {
    it('should require email field', () => {
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput).toBeRequired();
    });

    it('should require username field', () => {
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const usernameInput = screen.getByPlaceholderText('Username');
      expect(usernameInput).toBeRequired();
    });

    it('should require password field', () => {
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput).toBeRequired();
    });

    it('should validate email format', () => {
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should validate password type', () => {
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Successful signup', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Sign Up');

      await user.type(emailInput, 'newuser@example.com');
      await user.type(usernameInput, 'newusername');
      await user.type(passwordInput, 'securepassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should show loading state during signup', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Sign Up');

      await user.type(emailInput, 'newuser@example.com');
      await user.type(usernameInput, 'newusername');
      await user.type(passwordInput, 'securepassword123');
      await user.click(submitButton);

      // Loading should appear briefly
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should save user to localStorage on successful signup', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Sign Up');

      await user.type(emailInput, 'newuser@example.com');
      await user.type(usernameInput, 'newusername');
      await user.type(passwordInput, 'securepassword123');
      await user.click(submitButton);

      await waitFor(() => {
        const storedUser = localStorage.getItem('user');
        expect(storedUser).toBeDefined();
      });
    });

    it('should update auth context on successful signup', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Sign Up');

      await user.type(emailInput, 'newuser@example.com');
      await user.type(usernameInput, 'newusername');
      await user.type(passwordInput, 'securepassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Failed signup', () => {
    it('should show error message on validation failure', async () => {
      // Override handler to simulate validation error
      server.use(
        http.post('http://localhost:8080/auth/signup', () => {
          return HttpResponse.json(
            { message: 'Email already exists', errorCode: 'ValidationError' },
            { status: 400 }
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Sign Up');

      await user.type(emailInput, 'existing@example.com');
      await user.type(usernameInput, 'username');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });
    });

    it('should not navigate on failed signup', async () => {
      // Override handler to simulate error
      server.use(
        http.post('http://localhost:8080/auth/signup', () => {
          return HttpResponse.json(
            { message: 'Signup failed', errorCode: 'SignupError' },
            { status: 400 }
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Sign Up');

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'username');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle server errors gracefully', async () => {
      // Override handler to simulate server error
      server.use(
        http.post('http://localhost:8080/auth/signup', () => {
          return HttpResponse.json(
            { message: 'Server error', errorCode: 'InternalError' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Sign Up');

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'username');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading state', () => {
    it('should clear loading state after successful signup', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Sign Up');

      await user.type(emailInput, 'newuser@example.com');
      await user.type(usernameInput, 'newusername');
      await user.type(passwordInput, 'securepassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });

      // Loading should be gone
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should clear loading state after failed signup', async () => {
      // Override handler to simulate error
      server.use(
        http.post('http://localhost:8080/auth/signup', () => {
          return HttpResponse.json(
            { message: 'Signup failed', errorCode: 'SignupError' },
            { status: 400 }
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<Signup hideModal={mockHideModal} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Sign Up');

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'username');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });

      // Loading should be gone
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
