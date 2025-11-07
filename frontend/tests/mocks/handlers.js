import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080';

// Mock user data
const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  verified: true,
};

// Mock template data
const mockTemplate = {
  _id: 'template123',
  name: 'Test Template',
  type: 'root',
  text: 'Test template text',
  children: [],
  parent: null,
  userId: 'user123',
  kind: 'Template',
  wordWeight: 100,
};

// Mock storynode data
const mockStorynode = {
  _id: 'storynode123',
  name: 'Test Story',
  type: 'root',
  text: 'Test story text',
  children: [],
  parent: null,
  userId: 'user123',
  kind: 'Storynode',
  isComplete: false,
  wordWeight: 100,
  wordLimit: 1000,
  wordCount: 50,
  archived: false,
};

export const handlers = [
  // Auth endpoints
  http.post(`${BASE_URL}/auth/signup`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return HttpResponse.json(
        { message: 'Email and password are required', errorCode: 'ValidationError' },
        { status: 400 }
      );
    }

    return HttpResponse.json(mockUser, { status: 201 });
  }),

  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;

    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json(mockUser, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials', errorCode: 'InvalidCredentials' },
      { status: 401 }
    );
  }),

  http.get(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  }),

  http.get(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),

  http.get(`${BASE_URL}/auth/email/verify/:code`, ({ params }) => {
    const { code } = params;

    if (code === 'valid-code') {
      return HttpResponse.json({ message: 'Email verified successfully' }, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Invalid verification code', errorCode: 'InvalidVerificationCode' },
      { status: 400 }
    );
  }),

  http.post(`${BASE_URL}/auth/password/forgot`, async ({ request }) => {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return HttpResponse.json(
        { message: 'Email is required', errorCode: 'ValidationError' },
        { status: 400 }
      );
    }

    return HttpResponse.json({ message: 'Password reset email sent' }, { status: 200 });
  }),

  http.post(`${BASE_URL}/auth/password/reset`, async ({ request }) => {
    const body = await request.json();
    const { verificationCode, password } = body;

    if (!verificationCode || !password) {
      return HttpResponse.json(
        { message: 'Verification code and password are required', errorCode: 'ValidationError' },
        { status: 400 }
      );
    }

    if (verificationCode === 'valid-code') {
      return HttpResponse.json({ message: 'Password reset successful' }, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Invalid verification code', errorCode: 'InvalidVerificationCode' },
      { status: 400 }
    );
  }),

  // User endpoint
  http.get(`${BASE_URL}/user`, () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),

  // Template endpoints
  http.get(`${BASE_URL}/template`, () => {
    // Return different data based on query params if needed
    return HttpResponse.json([mockTemplate], { status: 200 });
  }),

  http.get(`${BASE_URL}/template/:id`, ({ params }) => {
    const { id } = params;

    if (id === 'template123') {
      return HttpResponse.json(mockTemplate, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Template not found', errorCode: 'NotFound' },
      { status: 404 }
    );
  }),

  http.get(`${BASE_URL}/template/getchildren/:id`, ({ params }) => {
    const { id } = params;

    if (id === 'template123') {
      return HttpResponse.json([], { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Template not found', errorCode: 'NotFound' },
      { status: 404 }
    );
  }),

  http.post(`${BASE_URL}/template`, async ({ request }) => {
    const body = await request.json();
    const { _id, name } = body;

    if (!name) {
      return HttpResponse.json(
        { message: 'Name is required', errorCode: 'ValidationError' },
        { status: 400 }
      );
    }

    // Update existing
    if (_id) {
      return HttpResponse.json({ ...mockTemplate, ...body }, { status: 200 });
    }

    // Create new
    return HttpResponse.json({ ...mockTemplate, ...body, _id: 'new-template-id' }, { status: 201 });
  }),

  http.delete(`${BASE_URL}/template/:id`, ({ params }) => {
    const { id } = params;

    if (id === 'template123') {
      return HttpResponse.json({ message: 'Template deleted successfully' }, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Template not found', errorCode: 'NotFound' },
      { status: 404 }
    );
  }),

  // Storynode endpoints
  http.get(`${BASE_URL}/storynode`, () => {

    // Return different data based on query params if needed
    return HttpResponse.json([mockStorynode], { status: 200 });
  }),

  http.get(`${BASE_URL}/storynode/:id`, ({ params }) => {
    const { id } = params;

    if (id === 'storynode123') {
      return HttpResponse.json(mockStorynode, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Storynode not found', errorCode: 'NotFound' },
      { status: 404 }
    );
  }),

  http.get(`${BASE_URL}/storynode/getchildren/:id`, ({ params }) => {
    const { id } = params;

    if (id === 'storynode123') {
      return HttpResponse.json([], { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Storynode not found', errorCode: 'NotFound' },
      { status: 404 }
    );
  }),

  http.post(`${BASE_URL}/storynode`, async ({ request }) => {
    const body = await request.json();
    const { _id, name } = body;

    if (!name) {
      return HttpResponse.json(
        { message: 'Name is required', errorCode: 'ValidationError' },
        { status: 400 }
      );
    }

    // Update existing
    if (_id) {
      return HttpResponse.json({ ...mockStorynode, ...body }, { status: 200 });
    }

    // Create new
    return HttpResponse.json({ ...mockStorynode, ...body, _id: 'new-storynode-id' }, { status: 201 });
  }),

  http.post(`${BASE_URL}/storynode/postfromtemplate`, async ({ request }) => {
    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return HttpResponse.json(
        { message: 'Template ID is required', errorCode: 'ValidationError' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { ...mockStorynode, _id: 'new-storynode-from-template', name: 'Story from Template' },
      { status: 201 }
    );
  }),

  http.delete(`${BASE_URL}/storynode/:id`, ({ params }) => {
    const { id } = params;

    if (id === 'storynode123') {
      return HttpResponse.json({ message: 'Storynode deleted successfully' }, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Storynode not found', errorCode: 'NotFound' },
      { status: 404 }
    );
  }),
];
