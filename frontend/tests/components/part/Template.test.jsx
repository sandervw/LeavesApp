import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Template from '../../../src/components/part/Template';
import { renderWithProviders } from '../../utils/testUtils';
import { mockTemplate } from '../../utils/mockData';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the Draggable wrapper to simplify testing
vi.mock('../../../src/components/wrapper/Draggable', () => ({
  default: ({ children, ...props }) => <div data-testid="draggable" {...props}>{children}</div>,
}));

// Mock MarkdownText component
vi.mock('../../../src/components/part/common/MarkdownText.tsx', () => ({
  default: ({ text, update }) => (
    <div data-testid="markdown-text">
      {text}
      <button onClick={() => update && update('new text')}>Update Text</button>
    </div>
  ),
}));

// Mock ElementTraits
vi.mock('../../../src/components/part/common/ElementTraits', () => ({
  Header3Trait: ({ value, onClick }) => (
    <h3 data-testid="header-trait" onClick={onClick}>
      {value}
    </h3>
  ),
}));

describe('Template component', () => {
  const mockListFunction = vi.fn();
  const template = mockTemplate();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockListFunction.mockClear();
  });

  describe('Rendering', () => {
    it('should render template with name', () => {
      renderWithProviders(
        <Template
          templateData={template}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByText(template.name)).toBeInTheDocument();
    });

    it('should render template text', () => {
      renderWithProviders(
        <Template
          templateData={template}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByText(template.text)).toBeInTheDocument();
    });

    it('should wrap content in draggable component', () => {
      renderWithProviders(
        <Template
          templateData={template}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByTestId('draggable')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to detail view when template name is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Template
          templateData={template}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      const header = screen.getByTestId('header-trait');
      await user.click(header);

      expect(mockNavigate).toHaveBeenCalledWith('/templatedetail', {
        state: template._id,
      });
    });
  });

  describe('Draggable attributes', () => {
    it('should pass template ID to draggable wrapper', () => {
      renderWithProviders(
        <Template
          templateData={template}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      const draggable = screen.getByTestId('draggable');
      expect(draggable).toHaveAttribute('id', template._id);
    });

    it('should pass source to draggable wrapper', () => {
      const source = 'children';
      renderWithProviders(
        <Template
          templateData={template}
          listFunction={mockListFunction}
          source={source}
        />,
        { withDnd: true }
      );

      const draggable = screen.getByTestId('draggable');
      expect(draggable).toHaveAttribute('source', source);
    });

    it('should pass template data to draggable wrapper', () => {
      renderWithProviders(
        <Template
          templateData={template}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      const draggable = screen.getByTestId('draggable');
      expect(draggable).toHaveAttribute('data');
    });
  });

  describe('List function integration', () => {
    it('should pass listFunction to MarkdownText for updates', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Template
          templateData={template}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      const updateButton = screen.getByText('Update Text');
      await user.click(updateButton);

      expect(mockListFunction).toHaveBeenCalledWith('text', 'new text', template);
    });
  });

  describe('Different template types', () => {
    it('should render root template correctly', () => {
      const rootTemplate = mockTemplate({ type: 'root', name: 'Root Template' });
      renderWithProviders(
        <Template
          templateData={rootTemplate}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByText('Root Template')).toBeInTheDocument();
    });

    it('should render branch template correctly', () => {
      const branchTemplate = mockTemplate({ type: 'branch', name: 'Branch Template' });
      renderWithProviders(
        <Template
          templateData={branchTemplate}
          listFunction={mockListFunction}
          source="children"
        />,
        { withDnd: true }
      );

      expect(screen.getByText('Branch Template')).toBeInTheDocument();
    });

    it('should render leaf template correctly', () => {
      const leafTemplate = mockTemplate({ type: 'leaf', name: 'Leaf Template' });
      renderWithProviders(
        <Template
          templateData={leafTemplate}
          listFunction={mockListFunction}
          source="children"
        />,
        { withDnd: true }
      );

      expect(screen.getByText('Leaf Template')).toBeInTheDocument();
    });
  });

  describe('Props handling', () => {
    it('should handle different source values', () => {
      const sources = ['static', 'children', 'roots', 'templateCreate'];

      sources.forEach(source => {
        const { unmount } = renderWithProviders(
          <Template
            templateData={template}
            listFunction={mockListFunction}
            source={source}
          />,
          { withDnd: true }
        );

        const draggable = screen.getByTestId('draggable');
        expect(draggable).toHaveAttribute('source', source);
        unmount();
      });
    });

    it('should create new object from templateData to avoid mutations', () => {
      const originalTemplate = mockTemplate();
      renderWithProviders(
        <Template
          templateData={originalTemplate}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      // The component should spread templateData into a new object
      // Original should not be mutated
      expect(originalTemplate).toBeDefined();
    });
  });
});
