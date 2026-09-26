import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { TrashIcon } from '../../stories/icons';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Modal, ModalClose } from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  args: {
    title: 'Edit profile',
    description: 'Changes are visible to everyone on your team.',
    size: 'md',
    onOpenChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    trigger: { control: false },
    footer: { control: false },
    children: { control: false },
    open: { control: false },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '16px' } as const;

const footer = (
  <>
    <ModalClose asChild>
      <Button variant="secondary">Cancel</Button>
    </ModalClose>
    <ModalClose asChild>
      <Button>Save changes</Button>
    </ModalClose>
  </>
);

/** Tab stays inside the dialog, Esc closes it, and focus returns to the trigger. */
export const Playground: Story = {
  args: {
    trigger: <Button>Edit profile</Button>,
    footer,
    children: (
      <div style={stack}>
        <Input label="Name" defaultValue="Amin Karimi" />
        <Input label="Email" type="email" defaultValue="amin@example.com" />
      </div>
    ),
  },
};

export const Confirmation: Story = {
  args: {
    size: 'sm',
    title: 'Delete this project?',
    description: 'All of its files are removed permanently. This cannot be undone.',
    trigger: (
      <Button variant="danger" startIcon={<TrashIcon />}>
        Delete project
      </Button>
    ),
    footer: (
      <>
        <ModalClose asChild>
          <Button variant="secondary">Keep project</Button>
        </ModalClose>
        <ModalClose asChild>
          <Button variant="danger">Delete</Button>
        </ModalClose>
      </>
    ),
  },
};

/** The body scrolls on its own; the title and the actions stay in view. */
export const LongContent: Story = {
  args: {
    size: 'lg',
    title: 'Terms of service',
    description: 'Please read these terms before continuing.',
    trigger: <Button variant="secondary">Read the terms</Button>,
    footer,
    children: Array.from({ length: 30 }, (_, i) => (
      <p key={i}>
        {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a
        ante venenatis dapibus posuere velit aliquet.
      </p>
    )),
  },
};

/**
 * Opened from state instead of a `trigger`, e.g. after a menu choice or a
 * failed request. Focus still returns to whatever had it before.
 */
export const Controlled: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open from state
        </Button>
        <Modal
          {...args}
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            args.onOpenChange?.(next);
          }}
          footer={footer}
        >
          Opened with <code>open</code> / <code>onOpenChange</code>.
        </Modal>
      </>
    );
  },
};

/** Switch Direction to RTL in the toolbar: the close button and actions move to the left. */
export const Persian: Story = {
  args: {
    title: 'ویرایش پروفایل',
    description: 'تغییرات برای همه‌ی اعضای تیم نمایش داده می‌شود.',
    closeLabel: 'بستن',
    trigger: <Button>ویرایش پروفایل</Button>,
    footer: (
      <>
        <ModalClose asChild>
          <Button variant="secondary">انصراف</Button>
        </ModalClose>
        <ModalClose asChild>
          <Button>ذخیره</Button>
        </ModalClose>
      </>
    ),
    children: (
      <div style={stack}>
        <Input label="نام و نام خانوادگی" defaultValue="امین کریمی" />
        <Input label="ایمیل" type="email" dir="ltr" defaultValue="amin@example.com" />
      </div>
    ),
  },
};
