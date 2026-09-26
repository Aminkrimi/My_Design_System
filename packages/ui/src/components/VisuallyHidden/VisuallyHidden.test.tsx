import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { axeViolations } from '../../test/axe';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('keeps its content in the accessibility tree', () => {
    render(
      <button type="button">
        <span aria-hidden="true">×</span>
        <VisuallyHidden>Close</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('forwards its ref and merges class names', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <VisuallyHidden ref={ref} className="extra">
        hidden
      </VisuallyHidden>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass('extra');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <button type="button">
        <VisuallyHidden>Close</VisuallyHidden>
      </button>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
