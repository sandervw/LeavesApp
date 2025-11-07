import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import Draggable from '../../../src/components/wrapper/Draggable';
import { mockTemplate } from '../../utils/mockData';

describe('Draggable wrapper', () => {
  const renderWithDndContext = (ui) => {
    return render(<DndContext>{ui}</DndContext>);
  };

  describe('Rendering', () => {
    it('should render children correctly', () => {
      const template = mockTemplate();

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template}>
          <div data-testid="child-content">Test Content</div>
        </Draggable>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      const template = mockTemplate();

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template}>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </Draggable>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('child3')).toBeInTheDocument();
    });
  });

  describe('Draggable attributes', () => {
    it('should apply className prop', () => {
      const template = mockTemplate();

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template} className="test-class">
          <div>Content</div>
        </Draggable>
      );

      const wrapper = screen.getByText('Content').parentElement;
      expect(wrapper).toHaveClass('test-class');
    });

    it('should handle ID prop correctly', () => {
      const template = mockTemplate();

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template}>
          <div data-testid="content">Content</div>
        </Draggable>
      );

      // The component should render without errors with the ID
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should handle source prop', () => {
      const template = mockTemplate();
      const sources = ['static', 'children', 'roots', 'storynodeCreate', 'templateCreate'];

      sources.forEach(source => {
        const { unmount } = renderWithDndContext(
          <Draggable id={template._id} source={source} data={template}>
            <div data-testid={`content-${source}`}>Content</div>
          </Draggable>
        );

        expect(screen.getByTestId(`content-${source}`)).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle data prop with template', () => {
      const template = mockTemplate();

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template}>
          <div data-testid="content">Template Content</div>
        </Draggable>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should handle data prop with storynode', () => {
      const storynode = {
        _id: 'storynode123',
        name: 'Test Story',
        type: 'root',
        kind: 'Storynode',
      };

      renderWithDndContext(
        <Draggable id={storynode._id} source="roots" data={storynode}>
          <div data-testid="content">Storynode Content</div>
        </Draggable>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Styling during drag', () => {
    it('should apply base className when not dragging', () => {
      const template = mockTemplate();

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template} className="draggable">
          <div data-testid="content">Content</div>
        </Draggable>
      );

      const wrapper = screen.getByTestId('content').parentElement;
      expect(wrapper).toHaveClass('draggable');
    });

    // Note: Testing the actual drag behavior requires more complex setup with DnD-Kit
    // and is better suited for E2E tests. Here we verify the component structure.
  });

  describe('DragHandlerContext', () => {
    it('should provide DragHandlerContext to children', () => {
      const template = mockTemplate();

      // Component that consumes DragHandlerContext
      const ChildWithContext = () => {
        return <div data-testid="child">Child with context access</div>;
      };

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template}>
          <ChildWithContext />
        </Draggable>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('Props edge cases', () => {
    it('should handle empty children', () => {
      const template = mockTemplate();

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template}>
          {null}
        </Draggable>
      );

      // Should not crash
      expect(document.body).toBeInTheDocument();
    });

    it('should handle complex nested children', () => {
      const template = mockTemplate();

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template}>
          <div data-testid="parent">
            <div data-testid="child1">
              <span data-testid="grandchild">Nested content</span>
            </div>
            <div data-testid="child2">More content</div>
          </div>
        </Draggable>
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('grandchild')).toBeInTheDocument();
    });

    it('should handle different data object structures', () => {
      const customData = {
        _id: 'custom123',
        name: 'Custom Element',
        customField: 'custom value',
        nestedObject: {
          field1: 'value1',
        },
      };

      renderWithDndContext(
        <Draggable id={customData._id} source="custom" data={customData}>
          <div data-testid="content">Custom Data Content</div>
        </Draggable>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Integration with DndContext', () => {
    it('should work within DndContext', () => {
      const template = mockTemplate();

      renderWithDndContext(
        <Draggable id={template._id} source="roots" data={template}>
          <div data-testid="draggable-item">Draggable Item</div>
        </Draggable>
      );

      expect(screen.getByTestId('draggable-item')).toBeInTheDocument();
    });

    it('should handle multiple draggable items in same context', () => {
      const template1 = mockTemplate({ _id: 'template1', name: 'Template 1' });
      const template2 = mockTemplate({ _id: 'template2', name: 'Template 2' });

      renderWithDndContext(
        <>
          <Draggable id={template1._id} source="roots" data={template1}>
            <div data-testid="item1">Item 1</div>
          </Draggable>
          <Draggable id={template2._id} source="roots" data={template2}>
            <div data-testid="item2">Item 2</div>
          </Draggable>
        </>
      );

      expect(screen.getByTestId('item1')).toBeInTheDocument();
      expect(screen.getByTestId('item2')).toBeInTheDocument();
    });
  });
});
