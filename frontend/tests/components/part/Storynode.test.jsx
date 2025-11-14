import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Storynode from '../../../src/components/part/Storynode';
import { renderWithProviders } from '../../utils/testUtils';
import { mockStorynode } from '../../utils/mockData';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the Draggable wrapper
vi.mock('../../../src/components/wrapper/Draggable', () => ({
  default: ({ children, ...props }) => <div data-testid="draggable" {...props}>{children}</div>,
}));

// Mock MarkdownText component
vi.mock('../../../src/components/part/common/MarkdownText', () => ({
  default: ({ text, update, wordCount, wordLimit, locked }) => (
    <div data-testid="markdown-text">
      {text}
      {wordLimit && <div data-testid="word-limit">Limit: {wordLimit}</div>}
      {locked && <div data-testid="locked">Locked</div>}
      <button onClick={() => update && update('new text')}>Update Text</button>
      {wordCount && <button onClick={() => wordCount(100)}>Update Word Count</button>}
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

describe('Storynode component', () => {
  const mockListFunction = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockListFunction.mockClear();
  });

  describe('Rendering', () => {
    it('should render storynode with name', () => {
      const storynode = mockStorynode();
      renderWithProviders(
        <Storynode
          storynodeData={storynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByText(storynode.name)).toBeInTheDocument();
    });

    it('should render storynode text', () => {
      const storynode = mockStorynode();
      renderWithProviders(
        <Storynode
          storynodeData={storynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByText(storynode.text)).toBeInTheDocument();
    });

    it('should wrap content in draggable component', () => {
      const storynode = mockStorynode();
      renderWithProviders(
        <Storynode
          storynodeData={storynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByTestId('draggable')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to detail view when storynode name is clicked', async () => {
      const user = userEvent.setup();
      const storynode = mockStorynode();
      renderWithProviders(
        <Storynode
          storynodeData={storynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      const header = screen.getByTestId('header-trait');
      await user.click(header);

      expect(mockNavigate).toHaveBeenCalledWith('/storydetail', {
        state: storynode._id,
      });
    });
  });

  describe('Word count for leaf nodes', () => {
    it('should show word count functionality for leaf nodes', () => {
      const leafStorynode = mockStorynode({
        type: 'leaf',
        wordCount: 100,
        wordLimit: 500,
      });

      renderWithProviders(
        <Storynode
          storynodeData={leafStorynode}
          listFunction={mockListFunction}
          source="children"
        />,
        { withDnd: true }
      );

      // Leaf nodes should have word count button
      expect(screen.getByText('Update Word Count')).toBeInTheDocument();
    });

    it('should not show word count functionality for branch nodes', () => {
      const branchStorynode = mockStorynode({
        type: 'branch',
        wordCount: 100,
      });

      renderWithProviders(
        <Storynode
          storynodeData={branchStorynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      // Branch nodes should not have word count button
      expect(screen.queryByText('Update Word Count')).not.toBeInTheDocument();
    });

    it('should calculate effective word limit for leaf nodes', () => {
      const leafStorynode = mockStorynode({
        type: 'leaf',
        wordCount: 100,
        wordLimit: 300,
      });

      renderWithProviders(
        <Storynode
          storynodeData={leafStorynode}
          listFunction={mockListFunction}
          source="children"
          parentWordLimit={500}
          totalWordCount={200}
        />,
        { withDnd: true }
      );

      // Should display word limit
      expect(screen.getByTestId('word-limit')).toBeInTheDocument();
    });

    it('should use storynode word limit when no parent limit exists', () => {
      const leafStorynode = mockStorynode({
        type: 'leaf',
        wordCount: 50,
        wordLimit: 200,
      });

      renderWithProviders(
        <Storynode
          storynodeData={leafStorynode}
          listFunction={mockListFunction}
          source="children"
        />,
        { withDnd: true }
      );

      expect(screen.getByTestId('word-limit')).toHaveTextContent('Limit: 200');
    });
  });

  describe('Locked state', () => {
    it('should show locked state when locked prop is true', () => {
      const storynode = mockStorynode({ type: 'leaf' });

      renderWithProviders(
        <Storynode
          storynodeData={storynode}
          listFunction={mockListFunction}
          source="children"
          locked={true}
        />,
        { withDnd: true }
      );

      expect(screen.getByTestId('locked')).toBeInTheDocument();
    });

    it('should not show locked state when locked prop is false', () => {
      const storynode = mockStorynode({ type: 'leaf' });

      renderWithProviders(
        <Storynode
          storynodeData={storynode}
          listFunction={mockListFunction}
          source="children"
          locked={false}
        />,
        { withDnd: true }
      );

      expect(screen.queryByTestId('locked')).not.toBeInTheDocument();
    });
  });

  describe('List function integration', () => {
    it('should call listFunction when text is updated', async () => {
      const user = userEvent.setup();
      const storynode = mockStorynode();

      renderWithProviders(
        <Storynode
          storynodeData={storynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      const updateButton = screen.getByText('Update Text');
      await user.click(updateButton);

      expect(mockListFunction).toHaveBeenCalledWith('text', 'new text', storynode);
    });

    it('should call listFunction when word count is updated on leaf', async () => {
      const user = userEvent.setup();
      const leafStorynode = mockStorynode({ type: 'leaf' });

      renderWithProviders(
        <Storynode
          storynodeData={leafStorynode}
          listFunction={mockListFunction}
          source="children"
        />,
        { withDnd: true }
      );

      const wordCountButton = screen.getByText('Update Word Count');
      await user.click(wordCountButton);

      expect(mockListFunction).toHaveBeenCalledWith('wordCount', 100, leafStorynode);
    });
  });

  describe('Different storynode types', () => {
    it('should render root storynode correctly', () => {
      const rootStorynode = mockStorynode({ type: 'root', name: 'Root Story' });

      renderWithProviders(
        <Storynode
          storynodeData={rootStorynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByText('Root Story')).toBeInTheDocument();
    });

    it('should render branch storynode correctly', () => {
      const branchStorynode = mockStorynode({ type: 'branch', name: 'Branch Story' });

      renderWithProviders(
        <Storynode
          storynodeData={branchStorynode}
          listFunction={mockListFunction}
          source="children"
        />,
        { withDnd: true }
      );

      expect(screen.getByText('Branch Story')).toBeInTheDocument();
    });

    it('should render leaf storynode correctly', () => {
      const leafStorynode = mockStorynode({ type: 'leaf', name: 'Leaf Story' });

      renderWithProviders(
        <Storynode
          storynodeData={leafStorynode}
          listFunction={mockListFunction}
          source="children"
        />,
        { withDnd: true }
      );

      expect(screen.getByText('Leaf Story')).toBeInTheDocument();
    });
  });

  describe('Completion state', () => {
    it('should handle complete storynodes', () => {
      const completedStorynode = mockStorynode({ isComplete: true });

      renderWithProviders(
        <Storynode
          storynodeData={completedStorynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByText(completedStorynode.name)).toBeInTheDocument();
    });

    it('should handle incomplete storynodes', () => {
      const incompleteStorynode = mockStorynode({ isComplete: false });

      renderWithProviders(
        <Storynode
          storynodeData={incompleteStorynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      expect(screen.getByText(incompleteStorynode.name)).toBeInTheDocument();
    });
  });

  describe('Draggable attributes', () => {
    it('should pass storynode ID to draggable wrapper', () => {
      const storynode = mockStorynode();

      renderWithProviders(
        <Storynode
          storynodeData={storynode}
          listFunction={mockListFunction}
          source="roots"
        />,
        { withDnd: true }
      );

      const draggable = screen.getByTestId('draggable');
      expect(draggable).toHaveAttribute('id', storynode._id);
    });

    it('should pass source to draggable wrapper', () => {
      const storynode = mockStorynode();
      const source = 'children';

      renderWithProviders(
        <Storynode
          storynodeData={storynode}
          listFunction={mockListFunction}
          source={source}
        />,
        { withDnd: true }
      );

      const draggable = screen.getByTestId('draggable');
      expect(draggable).toHaveAttribute('source', source);
    });
  });
});
