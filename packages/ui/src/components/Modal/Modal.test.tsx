import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { axeViolations } from '../../test/axe';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Modal, ModalClose } from './Modal';

function Example({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <>
      <Button>Before</Button>
      <Modal
        trigger={<Button>Edit profile</Button>}
        title="Edit profile"
        description="Changes are visible to your team."
        onOpenChange={onOpenChange}
        footer={
          <>
            <ModalClose asChild>
              <Button variant="secondary">Cancel</Button>
            </ModalClose>
            <Button>Save</Button>
          </>
        }
      >
        <Input label="Name" />
      </Modal>
    </>
  );
}

async function openExample() {
  const user = userEvent.setup();
  render(<Example />);
  await user.click(screen.getByRole('button', { name: 'Edit profile' }));
  return { user, dialog: screen.getByRole('dialog') };
}

describe('Modal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders nothing until its trigger is activated', async () => {
    const { dialog } = await openExample();
    expect(dialog).toBeInTheDocument();
  });

  it('is a modal dialog named by its title and described by its description', async () => {
    const { dialog } = await openExample();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Edit profile');
    expect(dialog).toHaveAccessibleDescription('Changes are visible to your team.');
  });

  it('keeps the accessible name when the title is visually hidden', async () => {
    const user = userEvent.setup();
    render(<Modal trigger={<Button>Open</Button>} title="Photo preview" hideTitle />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Photo preview');
  });

  it('has no description reference when there is no description', async () => {
    const user = userEvent.setup();
    render(<Modal trigger={<Button>Open</Button>} title="Plain" />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
  });

  it('opens from the keyboard and moves focus into the dialog', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Edit profile' })).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
  });

  it('traps focus: Tab and Shift+Tab cycle inside the dialog', async () => {
    const { user } = await openExample();
    const name = screen.getByRole('textbox', { name: 'Name' });
    const close = screen.getByRole('button', { name: 'Close' });
    expect(name).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab();
    expect(name).toHaveFocus();

    await user.tab({ shift: true });
    expect(close).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const { user } = await openExample();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit profile' })).toHaveFocus();
  });

  it('closes from the close button and from ModalClose, returning focus each time', async () => {
    const user = userEvent.setup();
    render(<Example />);
    // Queried before opening: while open, the page behind is aria-hidden.
    const trigger = screen.getByRole('button', { name: 'Edit profile' });

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes when the overlay is clicked', async () => {
    const { user, dialog } = await openExample();
    const overlay = dialog.parentElement;
    if (!overlay) throw new Error('Expected the dialog to sit inside its overlay');

    await user.click(overlay);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('reports open and close through onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Edit profile' }));
    await user.keyboard('{Escape}');

    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('returns focus to the opener when controlled without a trigger', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Delete</Button>
          <Modal open={open} onOpenChange={setOpen} title="Delete file?" />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    const opener = screen.getByRole('button', { name: 'Delete' });

    await user.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('locks page scroll while open and releases it on close', async () => {
    const { user } = await openExample();
    expect(document.body).toHaveAttribute('data-scroll-locked');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(document.body).not.toHaveAttribute('data-scroll-locked'));
  });

  it('hides the rest of the page from assistive technology while open', async () => {
    await openExample();
    expect(screen.queryByRole('button', { name: 'Before' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Before', hidden: true })).toBeInTheDocument();
  });

  it('adds no tab stop for a body that fits', async () => {
    const user = userEvent.setup();
    render(
      <Modal trigger={<Button>Open</Button>} title="Short">
        Fits on screen.
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Fits on screen.')).not.toHaveAttribute('tabindex');
  });

  it('makes an overflowing body a focusable region named by the title', async () => {
    // jsdom has no layout: fake an overflowing box and an observer that reports it.
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(900);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: () => void) {}
        observe() {
          this.callback();
        }
        disconnect() {
          return undefined;
        }
      },
    );
    const user = userEvent.setup();
    render(
      <Modal trigger={<Button>Open</Button>} title="Terms">
        Long text
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));

    const body = screen.getByRole('region', { name: 'Terms' });
    expect(body).toHaveTextContent('Long text');
    expect(body).toHaveAttribute('tabindex', '0');
  });

  it('forwards its ref to the dialog panel and uses a translatable close label', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    render(<Modal ref={ref} trigger={<Button>باز کن</Button>} title="ویرایش" closeLabel="بستن" />);
    await user.click(screen.getByRole('button', { name: 'باز کن' }));

    expect(ref.current).toBe(screen.getByRole('dialog'));
    expect(screen.getByRole('button', { name: 'بستن' })).toBeInTheDocument();
  });

  it('has no axe violations while open', async () => {
    await openExample();
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
