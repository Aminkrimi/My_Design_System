import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { axeViolations } from '../../test/axe';
import { Button, type ButtonVariant } from './Button';

describe('Button', () => {
  it('renders a button named by its label, defaulting to type="button"', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('can be activated with a click, Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('is reachable with Tab', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Button>First</Button>
        <Button>Second</Button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
  });

  it('does nothing and is skipped by Tab when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toBeDisabled();
    await user.click(button);
    await user.tab();

    expect(onClick).not.toHaveBeenCalled();
    expect(button).not.toHaveFocus();
  });

  it('blocks activation while loading but stays focusable and keeps its name', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');

    await user.tab();
    expect(button).toHaveFocus();

    await user.click(button);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not submit its form while loading', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(e) => onSubmit(e.nativeEvent as SubmitEvent)}>
        <Button type="submit" loading>
          Send
        </Button>
      </form>,
    );
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('hides decorative icons from assistive technology', () => {
    render(
      <Button startIcon={<svg data-testid="start" />} endIcon={<svg data-testid="end" />}>
        Next
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByTestId('start').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('end').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports icon-only buttons through aria-label', () => {
    render(<Button aria-label="Close" startIcon={<svg />} />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('forwards its ref and passes through native props', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} className="extra" data-testid="btn" form="f1">
        Save
      </Button>,
    );
    expect(ref.current).toBe(screen.getByTestId('btn'));
    expect(ref.current).toHaveClass('extra');
    expect(ref.current).toHaveAttribute('form', 'f1');
  });

  it.each<ButtonVariant>(['primary', 'secondary', 'ghost', 'danger'])(
    'has no axe violations (%s)',
    async (variant) => {
      const { container } = render(
        <>
          <Button variant={variant}>Default</Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
          <Button variant={variant} loading>
            Loading
          </Button>
        </>,
      );
      expect(await axeViolations(container)).toEqual([]);
    },
  );
});
