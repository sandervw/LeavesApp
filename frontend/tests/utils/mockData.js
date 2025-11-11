/**
 * Mock data generators for testing
 * Provides consistent mock data for users, templates, storynodes, and API responses
 */

/**
 * Generate a mock user object
 * @param {Object} overrides - Properties to override in the mock user
 * @returns {Object} Mock user object
 */
export const mockUser = (overrides = {}) => ({
  _id: 'user123',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  verified: true,
  ...overrides,
});

/**
 * Generate a mock template object
 * @param {Object} overrides - Properties to override in the mock template
 * @returns {Object} Mock template object
 */
export const mockTemplate = (overrides = {}) => ({
  _id: 'template123',
  name: 'Test Template',
  type: 'root',
  text: 'Test template text',
  children: [],
  parent: null,
  userId: 'user123',
  kind: 'Template',
  wordWeight: 100,
  ...overrides,
});

/**
 * Generate a mock template tree (root -> branch -> leaf)
 * @returns {Object} Object containing root, branch, and leaf templates
 */
export const mockTemplateTree = () => {
  const leaf = mockTemplate({
    _id: 'template-leaf',
    name: 'Leaf Template',
    type: 'leaf',
    parent: 'template-branch',
    children: [],
  });

  const branch = mockTemplate({
    _id: 'template-branch',
    name: 'Branch Template',
    type: 'branch',
    parent: 'template-root',
    children: [leaf._id],
  });

  const root = mockTemplate({
    _id: 'template-root',
    name: 'Root Template',
    type: 'root',
    parent: null,
    children: [branch._id],
  });

  return { root, branch, leaf };
};

/**
 * Generate a mock storynode object
 * @param {Object} overrides - Properties to override in the mock storynode
 * @returns {Object} Mock storynode object
 */
export const mockStorynode = (overrides = {}) => ({
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
  ...overrides,
});

/**
 * Generate a mock storynode tree (root -> branch -> leaf)
 * @returns {Object} Object containing root, branch, and leaf storynodes
 */
export const mockStorynodeTree = () => {
  const leaf = mockStorynode({
    _id: 'storynode-leaf',
    name: 'Leaf Story',
    type: 'leaf',
    parent: 'storynode-branch',
    children: [],
    wordCount: 100,
    wordLimit: 300,
  });

  const branch = mockStorynode({
    _id: 'storynode-branch',
    name: 'Branch Story',
    type: 'branch',
    parent: 'storynode-root',
    children: [leaf._id],
    wordCount: 100,
    wordLimit: 500,
  });

  const root = mockStorynode({
    _id: 'storynode-root',
    name: 'Root Story',
    type: 'root',
    parent: null,
    children: [branch._id],
    wordCount: 100,
    wordLimit: 1000,
  });

  return { root, branch, leaf };
};

/**
 * Generate mock API error response
 * @param {string} message - Error message
 * @param {string} errorCode - Error code
 * @returns {Object} Mock error response
 */
export const mockApiError = (message = 'An error occurred', errorCode = 'InternalError') => ({
  message,
  errorCode,
});

/**
 * Generate mock API success response
 * @param {Object} data - Response data
 * @returns {Object} Mock success response
 */
export const mockApiSuccess = (data) => data;

/**
 * Mock addable element (for sidebar)
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock addable object
 */
export const mockAddable = (overrides = {}) => ({
  _id: 'addable123',
  name: 'New Element',
  type: 'leaf',
  text: '',
  children: [],
  parent: null,
  userId: 'user123',
  ...overrides,
});

/**
 * Mock array of templates
 * @param {number} count - Number of templates to generate
 * @returns {Array} Array of mock templates
 */
export const mockTemplateList = (count = 3) => {
  return Array.from({ length: count }, (_, i) => mockTemplate({
    _id: `template${i + 1}`,
    name: `Template ${i + 1}`,
  }));
};

/**
 * Mock array of storynodes
 * @param {number} count - Number of storynodes to generate
 * @returns {Array} Array of mock storynodes
 */
export const mockStorynodeList = (count = 3) => {
  return Array.from({ length: count }, (_, i) => mockStorynode({
    _id: `storynode${i + 1}`,
    name: `Story ${i + 1}`,
  }));
};

/**
 * Mock localStorage data
 * @returns {Object} Object with localStorage methods
 */
export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};
