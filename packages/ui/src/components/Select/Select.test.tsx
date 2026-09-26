import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { axeViolations } from '../../test/axe';
import { Select, type SelectOption, type SelectProps } from './Select';

const countries: SelectOption[] = [
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'gr', label: 'Greece', disabled: true },
  { value: 'ir', label: 'Iran' },
  { value: 'it', label: 'Italy' },
];

function setup(props: Partial<SelectProps> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Select
      label="Country"
      placeholder="Choose a country"
      options={countries}
      onValueChange={onValueChange}
      {...props}
    />,
  );
  const trigger = screen.getByRole('combobox', { name: 'Country' });
  return { user, trigger, onValueChange };
}

describe('Select', () => {
  afterEach(() => {
    // Unmount first: changing <html dir> re-renders anything still mounted.
    cleanup();
    document.documentElement.removeAttribute('dir');
  });

  it('is a combobox labelled by its label, showing the placeholder', () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('Choose a country');
  });

  it.each(['{Enter}', ' ', '{ArrowDown}'])('opens from the keyboard with %s', async (key) => {
    const { user, trigger } = setup();
    await user.tab();
    expect(trigger).toHaveFocus();

    await user.keyboard(key);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Canada' })).toHaveFocus();
  });

  it('moves with the arrow keys, skips disabled options and selects with Enter', async () => {
    const { user, trigger, onValueChange } = setup();
    await user.tab();
    await user.keyboard('{Enter}');

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Germany' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Iran' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('option', { name: 'Germany' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('option', { name: 'Italy' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('option', { name: 'Canada' })).toHaveFocus();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onValueChange).toHaveBeenCalledWith('de');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('Germany');
    expect(trigger).toHaveFocus();
  });

  it('jumps to an option by typing its first letters', async () => {
    const { user } = setup();
    await user.tab();
    await user.keyboard('{Enter}');

    await user.keyboard('it');

    expect(screen.getByRole('option', { name: 'Italy' })).toHaveFocus();
  });

  it('selects by typing while closed, like a native select', async () => {
    const { user, trigger, onValueChange } = setup();
    await user.tab();

    await user.keyboard('i');

    expect(onValueChange).toHaveBeenCalledWith('ir');
    expect(trigger).toHaveTextContent('Iran');
  });

  it('closes on Escape without changing the value and returns focus', async () => {
    const { user, trigger, onValueChange } = setup({ defaultValue: 'ca' });
    await user.tab();
    await user.keyboard('{Enter}{ArrowDown}{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent('Canada');
    expect(trigger).toHaveFocus();
  });

  it('marks the selected option', async () => {
    const { user } = setup({ defaultValue: 'ir' });
    await user.tab();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('option', { name: 'Iran' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Iran' })).toHaveFocus();
  });

  it('works with a pointer', async () => {
    const { user, trigger, onValueChange } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Iran' }));

    expect(onValueChange).toHaveBeenCalledWith('ir');
    expect(trigger).toHaveTextContent('Iran');
  });

  it('cannot be opened or focused when disabled', async () => {
    const { user, trigger } = setup({ disabled: true });
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    await user.tab();

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).not.toHaveFocus();
  });

  it('describes the field with helper text and marks errors invalid', () => {
    const { trigger } = setup({
      helperText: 'Used for shipping',
      error: 'Choose a country to continue',
    });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAccessibleDescription('Used for shipping Choose a country to continue');
  });

  it('exposes required without reading the asterisk as part of the name', () => {
    const { trigger } = setup({ required: true });
    expect(trigger).toHaveAttribute('aria-required', 'true');
  });

  it('keeps the accessible name when the label is visually hidden', () => {
    setup({ hideLabel: true });
    expect(screen.getByRole('combobox', { name: 'Country' })).toBeInTheDocument();
  });

  it('submits its value with a form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      return new FormData(event.currentTarget).get('country');
    });
    render(
      <form onSubmit={onSubmit}>
        <Select label="Country" name="country" options={countries} defaultValue="de" />
        <button type="submit">Send</button>
      </form>,
    );
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveReturnedWith('de');
  });

  it('follows the document direction for the trigger and the list', async () => {
    document.documentElement.dir = 'rtl';
    const { user, trigger } = setup();
    expect(trigger).toHaveAttribute('dir', 'rtl');

    await user.tab();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('listbox').closest('[dir]')).toHaveAttribute('dir', 'rtl');
  });

  it('lets an explicit dir override the document', () => {
    document.documentElement.dir = 'rtl';
    const { trigger } = setup({ dir: 'ltr' });
    expect(trigger).toHaveAttribute('dir', 'ltr');
  });

  it('types Persian for typeahead', async () => {
    const user = userEvent.setup();
    render(
      <Select
        label="شهر"
        options={[
          { value: 'thr', label: 'تهران' },
          { value: 'shz', label: 'شیراز' },
          { value: 'tbz', label: 'تبریز' },
        ]}
      />,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard('تب');
    expect(screen.getByRole('option', { name: 'تبریز' })).toHaveFocus();
  });

  it('forwards its ref to the trigger and uses a provided id', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Select ref={ref} id="country" label="Country" options={countries} helperText="Hint" />);
    expect(ref.current).toBe(screen.getByRole('combobox', { name: 'Country' }));
    expect(ref.current).toHaveAttribute('id', 'country');
    expect(ref.current).toHaveAttribute('aria-describedby', 'country-helper');
  });

  it('has no axe violations closed (default, error, disabled) or open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Select label="Default" options={countries} helperText="Helper" />
        <Select label="With error" options={countries} error="Required" />
        <Select label="Disabled" options={countries} disabled />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);

    await user.click(screen.getByRole('combobox', { name: 'Default' }));
    expect(await axeViolations(container)).toEqual([]);
    // The open list is portaled to <body>, outside any landmark, so a whole-page
    // run trips axe's best-practice "region" rule; check the list itself instead.
    expect(await axeViolations(screen.getByRole('listbox'))).toEqual([]);
  });
});
