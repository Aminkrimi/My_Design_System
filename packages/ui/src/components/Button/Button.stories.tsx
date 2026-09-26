import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ArrowIcon, PlusIcon, TrashIcon } from '../../stories/icons';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Save changes',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    startIcon: { control: false },
    endIcon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' } as const;
const stack = { display: 'flex', flexDirection: 'column', gap: '16px' } as const;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} startIcon={<PlusIcon />}>
        New project
      </Button>
      <Button {...args} variant="secondary" endIcon={<ArrowIcon />}>
        Continue
      </Button>
      <Button {...args} variant="danger" startIcon={<TrashIcon />}>
        Delete
      </Button>
      <Button {...args} variant="ghost" aria-label="Add item" startIcon={<PlusIcon />} />
    </div>
  ),
};

/** Loading keeps the button focusable and its width stable; activation is blocked. */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Saving
      </Button>
      <Button {...args} variant="secondary">
        Saving
      </Button>
      <Button {...args} variant="ghost">
        Saving
      </Button>
      <Button {...args} variant="danger">
        Deleting
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div style={{ maxInlineSize: '24rem' }}>
      <Button {...args}>Sign in</Button>
    </div>
  ),
};

/** Switch Direction to RTL in the toolbar: icons move to the other side and the arrow flips. */
export const Persian: Story = {
  render: (args) => (
    <div style={stack}>
      <div style={row}>
        <Button {...args} startIcon={<PlusIcon />}>
          پروژه‌ی جدید
        </Button>
        <Button {...args} variant="secondary" endIcon={<ArrowIcon />}>
          ادامه
        </Button>
        <Button {...args} variant="ghost">
          انصراف
        </Button>
        <Button {...args} variant="danger" startIcon={<TrashIcon />}>
          حذف
        </Button>
      </div>
      <div style={row}>
        <Button {...args} loading>
          در حال ذخیره
        </Button>
        <Button {...args} disabled>
          غیرفعال
        </Button>
      </div>
    </div>
  ),
};
