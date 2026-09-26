import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { ToastProvider, useToast, type ToastOptions } from './Toast';

/**
 * Toasts are shown imperatively with `useToast()`. Press F8 to move focus to
 * the notifications; hovering or focusing them pauses auto-close.
 */
const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  args: {
    duration: 5000,
    label: 'Notifications ({hotkey})',
    closeLabel: 'Close',
    children: null,
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: 'flex', flexWrap: 'wrap', gap: '12px' } as const;

interface DemoButton {
  label: string;
  options: ToastOptions;
}

function Demo({
  buttons,
  dismissLabel = 'Dismiss all',
}: {
  buttons: DemoButton[];
  dismissLabel?: string;
}) {
  const { toast, dismiss } = useToast();
  return (
    <div style={row}>
      {buttons.map(({ label, options }) => (
        <Button key={label} variant="secondary" onClick={() => toast(options)}>
          {label}
        </Button>
      ))}
      <Button variant="ghost" onClick={() => dismiss()}>
        {dismissLabel}
      </Button>
    </div>
  );
}

const variants: DemoButton[] = [
  {
    label: 'Info',
    options: { title: 'New version available', description: 'Reload to get the latest features.' },
  },
  {
    label: 'Success',
    options: {
      variant: 'success',
      title: 'Changes saved',
      description: 'Your profile is up to date.',
    },
  },
  {
    label: 'Error',
    options: {
      variant: 'error',
      title: 'Upload failed',
      description: 'The file is larger than 10 MB. Errors stay until you close them.',
    },
  },
];

/** Info and success close after `duration`; errors stay until dismissed. */
export const Playground: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <Demo buttons={variants} />
    </ToastProvider>
  ),
};

/** Screen readers announce `altText` instead of the button label. */
export const WithAction: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <Demo
        buttons={[
          {
            label: 'Archive message',
            options: {
              variant: 'success',
              title: 'Message archived',
              action: {
                label: 'Undo',
                altText: 'Undo from the Archive folder',
                onClick: () => undefined,
              },
            },
          },
        ]}
      />
    </ToastProvider>
  ),
};

/**
 * Switch Direction to RTL in the toolbar: toasts appear bottom-left, slide in
 * from the left and are swiped away to the left.
 */
export const Persian: Story = {
  args: {
    label: 'اعلان‌ها ({hotkey})',
    closeLabel: 'بستن',
  },
  render: (args) => (
    <ToastProvider {...args}>
      <Demo
        dismissLabel="بستن همه"
        buttons={[
          {
            label: 'اطلاع',
            options: {
              title: 'نسخه‌ی جدید آماده است',
              description: 'برای دریافت، صفحه را تازه کنید.',
            },
          },
          {
            label: 'موفق',
            options: { variant: 'success', title: 'تغییرات ذخیره شد' },
          },
          {
            label: 'خطا',
            options: {
              variant: 'error',
              title: 'بارگذاری ناموفق بود',
              description: 'حجم فایل بیشتر از ۱۰ مگابایت است.',
              action: {
                label: 'تلاش دوباره',
                altText: 'از صفحه‌ی بارگذاری‌ها دوباره تلاش کنید',
                onClick: () => undefined,
              },
            },
          },
        ]}
      />
    </ToastProvider>
  ),
};
