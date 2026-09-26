import type { Meta, StoryObj } from '@storybook/react-vite';
import { MailIcon, SearchIcon } from '../../stories/icons';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
  },
  argTypes: {
    prefix: { control: false },
    suffix: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '24px' } as const;

export const Playground: Story = {};

export const WithHelperText: Story = {
  args: { helperText: 'We will only use this to send receipts.' },
};

export const WithError: Story = {
  args: {
    defaultValue: 'amin@',
    helperText: 'We will only use this to send receipts.',
    error: 'Enter a complete email address, like name@example.com.',
  },
};

export const Required: Story = {
  args: { required: true, helperText: 'Required fields are marked with *.' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'amin@example.com' },
};

export const PrefixAndSuffix: Story = {
  render: (args) => (
    <div style={stack}>
      <Input {...args} type="email" prefix={<MailIcon />} />
      <Input label="Price" placeholder="0" inputMode="decimal" prefix="$" suffix="USD" />
      <Input label="Website" placeholder="example.com" prefix="https://" dir="ltr" />
    </div>
  ),
};

export const HiddenLabel: Story = {
  args: {
    label: 'Search',
    hideLabel: true,
    placeholder: 'Search components…',
    prefix: <SearchIcon />,
    type: 'search',
  },
};

/**
 * Switch Direction to RTL in the toolbar. Values that are always Latin
 * (email, URL) keep `dir="ltr"` on the input so they read correctly.
 */
export const Persian: Story = {
  render: () => (
    <div style={stack}>
      <Input label="نام و نام خانوادگی" placeholder="مثلاً امین کریمی" required />
      <Input
        label="ایمیل"
        type="email"
        dir="ltr"
        placeholder="you@example.com"
        prefix={<MailIcon />}
        helperText="رسید خرید به این آدرس فرستاده می‌شود."
      />
      <Input
        label="رمز عبور"
        type="password"
        defaultValue="123"
        helperText="حداقل ۸ کاراکتر."
        error="رمز عبور کوتاه است."
      />
      <Input label="مبلغ" placeholder="۰" inputMode="numeric" suffix="تومان" />
    </div>
  ),
};
