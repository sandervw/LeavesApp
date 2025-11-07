import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import Droppable from '../../../src/components/wrapper/Droppable';

describe('Droppable wrapper', () => {
  const renderWithDndContext = (ui) => {
    return render(<DndContext>{ui}</DndContext>);
  };

  describe('Rendering', () => {
    it('should render children correctly', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="droppable-1" function={mockFunction} className="drop-zone">
          <div data-testid="child-content">Drop Content Here</div>
        </Droppable>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Drop Content Here')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="droppable-1" function={mockFunction}>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </Droppable>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('child3')).toBeInTheDocument();
    });
  });

  describe('Droppable attributes', () => {
    it('should apply className prop', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="droppable-1" function={mockFunction} className="custom-drop-zone">
          <div data-testid="content">Content</div>
        </Droppable>
      );

      const wrapper = screen.getByTestId('content').parentElement;
      expect(wrapper).toHaveClass('custom-drop-zone');
    });

    it('should handle ID prop correctly', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="unique-droppable-id" function={mockFunction}>
          <div data-testid="content">Content</div>
        </Droppable>
      );

      // The component should render without errors with the ID
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should handle function prop', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="droppable-1" function={mockFunction}>
          <div data-testid="content">Content</div>
        </Droppable>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
      // The function is stored in the droppable data for use during drop events
    });
  });

  describe('Different droppable zones', () => {
    it('should render droppable for template creation', () => {
      const createTemplateFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="template-create-zone" function={createTemplateFunction} className="template-drop">
          <div data-testid="template-zone">Drop to create template</div>
        </Droppable>
      );

      expect(screen.getByTestId('template-zone')).toBeInTheDocument();
      expect(screen.getByTestId('template-zone').parentElement).toHaveClass('template-drop');
    });

    it('should render droppable for storynode creation', () => {
      const createStorynodeFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="storynode-create-zone" function={createStorynodeFunction} className="storynode-drop">
          <div data-testid="storynode-zone">Drop to create storynode</div>
        </Droppable>
      );

      expect(screen.getByTestId('storynode-zone')).toBeInTheDocument();
      expect(screen.getByTestId('storynode-zone').parentElement).toHaveClass('storynode-drop');
    });

    it('should render droppable for deletion', () => {
      const deleteFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="delete-zone" function={deleteFunction} className="delete-drop">
          <div data-testid="delete-zone">Drop to delete</div>
        </Droppable>
      );

      expect(screen.getByTestId('delete-zone')).toBeInTheDocument();
      expect(screen.getByTestId('delete-zone').parentElement).toHaveClass('delete-drop');
    });
  });

  describe('Props edge cases', () => {
    it('should handle empty children', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="droppable-1" function={mockFunction}>
          {null}
        </Droppable>
      );

      // Should not crash
      expect(document.body).toBeInTheDocument();
    });

    it('should handle complex nested children', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="droppable-1" function={mockFunction}>
          <div data-testid="parent">
            <div data-testid="child1">
              <span data-testid="grandchild">Nested drop zone</span>
            </div>
            <div data-testid="child2">More content</div>
          </div>
        </Droppable>
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('grandchild')).toBeInTheDocument();
    });

    it('should handle undefined className', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="droppable-1" function={mockFunction}>
          <div data-testid="content">Content</div>
        </Droppable>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should handle undefined function prop', () => {
      renderWithDndContext(
        <Droppable id="droppable-1">
          <div data-testid="content">Content</div>
        </Droppable>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Integration with DndContext', () => {
    it('should work within DndContext', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <Droppable id="droppable-1" function={mockFunction}>
          <div data-testid="droppable-area">Droppable Area</div>
        </Droppable>
      );

      expect(screen.getByTestId('droppable-area')).toBeInTheDocument();
    });

    it('should handle multiple droppable areas in same context', () => {
      const mockFunction1 = vi.fn();
      const mockFunction2 = vi.fn();

      renderWithDndContext(
        <>
          <Droppable id="droppable-1" function={mockFunction1} className="zone-1">
            <div data-testid="area1">Area 1</div>
          </Droppable>
          <Droppable id="droppable-2" function={mockFunction2} className="zone-2">
            <div data-testid="area2">Area 2</div>
          </Droppable>
        </>
      );

      expect(screen.getByTestId('area1')).toBeInTheDocument();
      expect(screen.getByTestId('area2')).toBeInTheDocument();
      expect(screen.getByTestId('area1').parentElement).toHaveClass('zone-1');
      expect(screen.getByTestId('area2').parentElement).toHaveClass('zone-2');
    });

    it('should handle unique IDs for multiple droppable areas', () => {
      const mockFunction = vi.fn();

      renderWithDndContext(
        <>
          <Droppable id="unique-id-1" function={mockFunction}>
            <div data-testid="area1">Area 1</div>
          </Droppable>
          <Droppable id="unique-id-2" function={mockFunction}>
            <div data-testid="area2">Area 2</div>
          </Droppable>
          <Droppable id="unique-id-3" function={mockFunction}>
            <div data-testid="area3">Area 3</div>
          </Droppable>
        </>
      );

      expect(screen.getByTestId('area1')).toBeInTheDocument();
      expect(screen.getByTestId('area2')).toBeInTheDocument();
      expect(screen.getByTestId('area3')).toBeInTheDocument();
    });
  });

  describe('Different function types', () => {
    it('should handle arrow function', () => {
      const arrowFunction = () => console.log('dropped');

      renderWithDndContext(
        <Droppable id="droppable-1" function={arrowFunction}>
          <div data-testid="content">Content</div>
        </Droppable>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should handle async function', () => {
      const asyncFunction = async () => {
        await Promise.resolve();
      };

      renderWithDndContext(
        <Droppable id="droppable-1" function={asyncFunction}>
          <div data-testid="content">Content</div>
        </Droppable>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should handle function with parameters', () => {
      const paramFunction = (data) => {
        console.log('Dropped:', data);
      };

      renderWithDndContext(
        <Droppable id="droppable-1" function={paramFunction}>
          <div data-testid="content">Content</div>
        </Droppable>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });
});
