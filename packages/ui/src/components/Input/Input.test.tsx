import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { axeViolations } from '../../test/axe';
import { Input } from './Input';

describe('Input', () => {
  it('is labelled by its label', () => {
    render(<Input label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('keeps the accessible name when the label is visually hidden', () => {
    render(<Input label="Search" hideLabel />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('accepts typing and reports changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Name' });

    await user.type(input, 'Amin');

    expect(input).toHaveValue('Amin');
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it('is focused by clicking its label and reachable with Tab', async () => {
    const user = userEvent.setup();
    render(<Input label="City" />);
    const input = screen.getByRole('textbox', { name: 'City' });

    await user.click(screen.getByText('City'));
    expect(input).toHaveFocus();

    input.blur();
    await user.tab();
    expect(input).toHaveFocus();
  });

  it('describes the field with its helper text', () => {
    render(<Input label="Password" helperText="At least 8 characters" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAccessibleDescription('At least 8 characters');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('marks the field invalid and describes it with the error', () => {
    render(
      <Input label="Password" helperText="At least 8 characters" error="Password is too short" />,
    );
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('At least 8 characters Password is too short');
  });

  it('keeps a consumer-provided aria-describedby', () => {
    render(
      <>
        <p id="hint">Shown on your profile</p>
        <Input label="Username" aria-describedby="hint" helperText="Letters only" />
      </>,
    );
    expect(screen.getByLabelText('Username')).toHaveAccessibleDescription(
      'Shown on your profile Letters only',
    );
  });

  it('exposes required without reading the asterisk as part of the name', () => {
    render(<Input label="Email" required />);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeRequired();
  });

  it('cannot be edited when disabled', async () => {
    const user = userEvent.setup();
    render(<Input label="Code" disabled defaultValue="1234" />);
    const input = screen.getByRole('textbox', { name: 'Code' });

    await user.type(input, '5');

    expect(input).toBeDisabled();
    expect(input).toHaveValue('1234');
  });

  it('renders prefix and suffix content around the field', () => {
    render(<Input label="Price" prefix="$" suffix="USD" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Price' })).toBeInTheDocument();
  });

  it('uses a provided id and forwards its ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} id="email" label="Email" helperText="We never share it" />);
    expect(ref.current).toHaveAttribute('id', 'email');
    expect(ref.current).toHaveAttribute('aria-describedby', 'email-helper');
  });

  it('has no axe violations in its default, error and disabled states', async () => {
    const { container } = render(
      <>
        <Input label="Default" helperText="Helper" />
        <Input label="With error" error="Something is wrong" />
        <Input label="Disabled" disabled />
        <Input label="Hidden label" hideLabel prefix="@" />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
