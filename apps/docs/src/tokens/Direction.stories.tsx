import type { Meta, StoryObj } from '@storybook/react-vite';
import styles from './TokenTable.module.css';

const meta = {
  title: 'Foundations/Direction',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Switch **Direction** in the toolbar: the accent bar and the padding flip
 * sides because everything uses logical properties (`*-inline-start`), never
 * `left`/`right`.
 */
export const LogicalProperties: Story = {
  render: () => (
    <div
      className={styles.card}
      style={{
        borderInlineStart: '4px solid var(--mds-color-primary)',
        paddingInlineStart: 'var(--mds-space-6)',
        maxInlineSize: '36rem',
      }}
    >
      <strong>Start-aligned callout · اعلان هم‌تراز با ابتدا</strong>
      <p style={{ margin: 0 }}>
        This border sits on the inline-start edge: left in LTR, right in RTL.
        <br />
        این حاشیه در لبه‌ی ابتدای خط قرار دارد: در چپ‌به‌راست سمت چپ و در راست‌به‌چپ سمت راست.
      </p>
    </div>
  ),
};
