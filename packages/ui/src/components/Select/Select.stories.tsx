import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Modal } from '../Modal/Modal';
import { Select, type SelectOption } from './Select';

const countries: SelectOption[] = [
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'gr', label: 'Greece' },
  { value: 'ir', label: 'Iran' },
  { value: 'it', label: 'Italy' },
  { value: 'jp', label: 'Japan' },
  { value: 'nl', label: 'Netherlands' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Country',
    placeholder: 'Choose a country',
    options: countries,
    onValueChange: fn(),
  },
  argTypes: {
    options: { control: false },
    dir: { control: 'inline-radio', options: [undefined, 'ltr', 'rtl'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const stack = { display: 'flex', flexDirection: 'column', gap: '24px' } as const;

/** Arrow keys, Home/End and typing a name all work, open or closed. */
export const Playground: Story = {};

export const WithHelperText: Story = {
  args: { helperText: 'We ship to these countries only.' },
};

export const WithError: Story = {
  args: {
    required: true,
    helperText: 'We ship to these countries only.',
    error: 'Choose a country to continue.',
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'ir' },
};

/** Disabled options are skipped by the arrow keys and typeahead. */
export const DisabledOptions: Story = {
  args: {
    label: 'Plan',
    placeholder: 'Choose a plan',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
      { value: 'team', label: 'Team (sold out)', disabled: true },
      { value: 'enterprise', label: 'Enterprise' },
    ],
  },
};

/** The list scrolls, with arrow buttons at either end. */
export const LongList: Story = {
  args: {
    label: 'Time zone',
    placeholder: 'Choose a time zone',
    options: Array.from({ length: 27 }, (_, i) => {
      const offset = i - 12;
      const label = `UTC${offset >= 0 ? '+' : '−'}${String(Math.abs(offset)).padStart(2, '0')}:00`;
      return { value: String(offset), label };
    }),
  },
};

/** Sits next to Input with the same label, helper and error layout. */
export const InAForm: Story = {
  render: (args) => (
    <form style={stack} onSubmit={(event) => event.preventDefault()}>
      <Input label="Full name" required />
      <Select {...args} name="country" required />
      <Button type="submit">Continue</Button>
    </form>
  ),
};

/** The list layers above an open Modal. */
export const InsideAModal: Story = {
  render: (args) => (
    <Modal trigger={<Button>Shipping address</Button>} title="Shipping address">
      <div style={stack}>
        <Input label="Street" />
        <Select {...args} />
      </div>
    </Modal>
  ),
};

/**
 * Switch Direction to RTL in the toolbar: the chevron moves to the left, the
 * list aligns to the right edge and typeahead matches Persian letters.
 */
export const Persian: Story = {
  render: () => (
    <div style={stack}>
      <Select
        label="استان"
        placeholder="یک استان انتخاب کنید"
        required
        helperText="برای محاسبه‌ی هزینه‌ی ارسال."
        options={[
          { value: 'thr', label: 'تهران' },
          { value: 'esf', label: 'اصفهان' },
          { value: 'fars', label: 'فارس' },
          { value: 'tbz', label: 'آذربایجان شرقی' },
          { value: 'khr', label: 'خراسان رضوی' },
          { value: 'gil', label: 'گیلان' },
        ]}
      />
      <Select
        label="روش ارسال"
        placeholder="انتخاب کنید"
        error="روش ارسال را انتخاب کنید."
        options={[
          { value: 'post', label: 'پست پیشتاز' },
          { value: 'courier', label: 'پیک' },
        ]}
      />
    </div>
  ),
};
