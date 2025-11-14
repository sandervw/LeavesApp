import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import useAPI from '../../src/hooks/useAPI';

describe('useAPI hook', () => {
  beforeEach(() => {
    // Reset any runtime request handlers between tests
    server.resetHandlers();
  });

  describe('Successful API calls', () => {
    it('should successfully call API method and return data', async () => {
      const { result } = renderHook(() => useAPI());

      // Call the login API
      let response;
      await waitFor(async () => {
        response = await result.current.apiCall('authLogin', {
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(response).toBeDefined();
      expect(response.email).toBe('test@example.com');
      expect(result.current.error).toBeNull();
      expect(result.current.isPending).toBe(false);
    });

    it('should handle getUser API call', async () => {
      const { result } = renderHook(() => useAPI());

      let response;
      await waitFor(async () => {
        response = await result.current.apiCall('getUser');
      });

      expect(response).toBeDefined();
      expect(response._id).toBe('user123');
      expect(result.current.error).toBeNull();
      expect(result.current.isPending).toBe(false);
    });

    it('should handle fetchElements API call', async () => {
      const { result } = renderHook(() => useAPI());

      let response;
      await waitFor(async () => {
        response = await result.current.apiCall('fetchElements', 'template');
      });

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isPending).toBe(false);
    });

    it('should handle upsertElement API call', async () => {
      const { result } = renderHook(() => useAPI());

      const newTemplate = {
        name: 'New Template',
        text: 'Template text',
        type: 'root',
      };

      let response;
      await waitFor(async () => {
        response = await result.current.apiCall('upsertElement', 'template', newTemplate);
      });

      expect(response).toBeDefined();
      expect(response.name).toBe('New Template');
      expect(result.current.error).toBeNull();
      expect(result.current.isPending).toBe(false);
    });

    it('should handle downloadStory API call', async () => {
      const { result } = renderHook(() => useAPI());

      let response;
      await waitFor(async () => {
        response = await result.current.apiCall('downloadStory', 'storynode123');
      });

      expect(response).toBeDefined();
      expect(response.storyText).toBe('This is the story text content from the storynode.');
      expect(result.current.error).toBeNull();
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors and set error state', async () => {
      const { result } = renderHook(() => useAPI());

      // Call login with invalid credentials
      await waitFor(async () => {
        await result.current.apiCall('authLogin', {
          email: 'wrong@example.com',
          password: 'wrongpass',
        });
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });

    it('should handle network errors', async () => {
      // Override handler to simulate network error
      server.use(
        http.get('http://localhost:8080/user', () => {
          return HttpResponse.json(
            { message: 'Network error', errorCode: 'NetworkError' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useAPI());

      await waitFor(async () => {
        await result.current.apiCall('getUser');
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });

    it('should throw error for unknown API method', async () => {
      const { result } = renderHook(() => useAPI());

      await expect(async () => {
        await result.current.apiCall('nonExistentMethod');
      }).rejects.toThrow('Unknown API method: nonExistentMethod');
    });
  });

  describe('Loading states', () => {
    it('should set isPending to true during API call', async () => {
      const { result } = renderHook(() => useAPI());

      // Verify isPending starts as false
      expect(result.current.isPending).toBe(false);

      // Start API call
      const promise = result.current.apiCall('getUser');

      // Wait for the API call to complete
      await waitFor(async () => {
        await promise;
      });

      // Check isPending is false after completion
      expect(result.current.isPending).toBe(false);
    });

    it('should clear error on new API call', async () => {
      const { result } = renderHook(() => useAPI());

      // Make a failing call
      await waitFor(async () => {
        await result.current.apiCall('authLogin', {
          email: 'wrong@example.com',
          password: 'wrongpass',
        });
      });

      expect(result.current.error).toBeDefined();

      // Make a successful call
      await waitFor(async () => {
        await result.current.apiCall('authLogin', {
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Wait for error to be cleared
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Multiple API calls', () => {
    it('should handle multiple sequential API calls', async () => {
      const { result } = renderHook(() => useAPI());

      // First call
      let response1;
      await waitFor(async () => {
        response1 = await result.current.apiCall('fetchElements', 'template');
      });

      expect(response1).toBeDefined();
      expect(result.current.error).toBeNull();

      // Second call
      let response2;
      await waitFor(async () => {
        response2 = await result.current.apiCall('getUser');
      });

      expect(response2).toBeDefined();
      expect(result.current.error).toBeNull();
    });
  });
});
