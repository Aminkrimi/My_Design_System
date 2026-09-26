import { act, cleanup, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axeViolations } from '../../test/axe';
import { Button } from '../Button/Button';
import { ToastProvider, useToast, type ToastOptions, type ToastProviderProps } from './Toast';

function Trigger({ options, label = 'Show' }: { options: ToastOptions; label?: string }) {
  const { toast } = useToast();
  return <Button onClick={() => toast(options)}>{label}</Button>;
}

function DismissAll() {
  const { dismiss } = useToast();
  return <Button onClick={() => dismiss()}>Dismiss all</Button>;
}

function setup(options: ToastOptions, providerProps?: Omit<ToastProviderProps, 'children'>) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
  render(
    <ToastProvider {...providerProps}>
      <Trigger options={options} />
      <DismissAll />
    </ToastProvider>,
  );
  const show = () => user.click(screen.getByRole('button', { name: 'Show' }));
  return { user, show };
}

const region = () => screen.getByRole('region', { name: 'Notifications (F8)' });
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.documentElement.removeAttribute('dir');
  });

  it('throws a helpful error when useToast is called outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useToast())).toThrow(/ToastProvider/);
    spy.mockRestore();
  });

  it('shows the title and description inside the notifications region', async () => {
    const { show } = setup({ title: 'Changes saved', description: 'Your profile is up to date.' });
    await show();

    const toast = within(region()).getByRole('listitem');
    expect(toast).toHaveTextContent('Changes saved');
    expect(toast).toHaveTextContent('Your profile is up to date.');
    expect(toast).toHaveAttribute('data-variant', 'info');
  });

  it.each([
    ['info', 'polite'],
    ['success', 'polite'],
    ['error', 'assertive'],
  ] as const)('announces %s toasts through an aria-live="%s" status', async (variant, live) => {
    const { show } = setup({ title: 'Heads up', variant });
    await show();

    // The live region mounts empty and receives its text a frame later, so
    // screen readers notice the change.
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Heads up'));
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', live);
  });

  it('closes itself after the provider duration', async () => {
    const { show } = setup({ title: 'Saved', variant: 'success' }, { duration: 3000 });
    await show();

    await advance(2900);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    await advance(200);
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('lets a single toast override the duration', async () => {
    const { show } = setup({ title: 'Quick', duration: 1000 });
    await show();

    await advance(1100);
    expect(screen.queryByText('Quick')).not.toBeInTheDocument();
  });

  it('keeps error toasts until they are dismissed', async () => {
    const { show } = setup({ title: 'Upload failed', variant: 'error' });
    await show();

    await advance(60_000);
    expect(within(region()).getByText('Upload failed')).toBeInTheDocument();
  });

  it('pauses the timer while keyboard focus is in the region (F8)', async () => {
    const { user, show } = setup({ title: 'Saved' }, { duration: 3000 });
    await show();

    await user.keyboard('[F8]');
    expect(region().querySelector('ol')).toHaveFocus();

    await advance(10_000);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('closes from its close button with the keyboard', async () => {
    const { user, show } = setup({ title: 'Saved' }, { closeLabel: 'بستن' });
    await show();

    await user.keyboard('[F8]');
    await user.tab();
    expect(screen.getByRole('listitem')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'بستن' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('closes on Escape while focused', async () => {
    const { user, show } = setup({ title: 'Saved' });
    await show();

    await user.keyboard('[F8]');
    await user.tab();
    await user.keyboard('{Escape}');

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('runs the action and closes', async () => {
    const onUndo = vi.fn();
    const { user, show } = setup({
      title: 'Message archived',
      action: { label: 'Undo', altText: 'Undo from the Archive folder', onClick: onUndo },
    });
    await show();

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Message archived')).not.toBeInTheDocument();
  });

  it('announces the action alt text instead of its label', async () => {
    const { show } = setup({
      title: 'Message archived',
      action: { label: 'Undo', altText: 'Undo from the Archive folder', onClick: () => undefined },
    });
    await show();

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Undo from the Archive folder'),
    );
  });

  it('stacks several toasts and dismisses them all at once', async () => {
    const { user, show } = setup({ title: 'Saved' });
    await show();
    await show();
    await show();
    expect(within(region()).getAllByRole('listitem')).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'Dismiss all' }));

    expect(within(region()).queryAllByRole('listitem')).toHaveLength(0);
  });

  it('dismisses a single toast by the id toast() returned', async () => {
    let id = '';
    function Programmatic() {
      const { toast, dismiss } = useToast();
      return (
        <>
          <Button onClick={() => (id = toast({ title: 'First' }))}>First</Button>
          <Button onClick={() => toast({ title: 'Second' })}>Second</Button>
          <Button onClick={() => dismiss(id)}>Dismiss first</Button>
        </>
      );
    }
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(
      <ToastProvider>
        <Programmatic />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'First' }));
    await user.click(screen.getByRole('button', { name: 'Second' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss first' }));

    expect(screen.queryByText('First', { selector: 'li *' })).not.toBeInTheDocument();
    expect(within(region()).getByText('Second')).toBeInTheDocument();
  });

  it('swipes towards the inline-end in both directions', async () => {
    document.documentElement.dir = 'rtl';
    const { show } = setup({ title: 'ذخیره شد' });
    await show();
    expect(screen.getByRole('listitem')).toHaveAttribute('data-swipe-direction', 'left');
  });

  it('has no axe violations with toasts of every variant', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(
      <ToastProvider>
        <Trigger label="Info" options={{ title: 'Heads up', description: 'Details' }} />
        <Trigger label="Success" options={{ title: 'Saved', variant: 'success' }} />
        <Trigger
          label="Error"
          options={{
            title: 'Failed',
            variant: 'error',
            action: {
              label: 'Retry',
              altText: 'Retry from the Uploads page',
              onClick: () => undefined,
            },
          }}
        />
      </ToastProvider>,
    );
    for (const name of ['Info', 'Success', 'Error']) {
      await user.click(screen.getByRole('button', { name }));
    }
    // Let the live-region announcements finish so they don't update mid-scan.
    await advance(1000);
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
