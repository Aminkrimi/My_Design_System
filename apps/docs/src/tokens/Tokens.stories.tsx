import type { Meta, StoryObj } from '@storybook/react-vite';
import { color, fontSize, fontWeight, lineHeight, radius, shadow, space } from '@mds/tokens';
import styles from './TokenTable.module.css';

const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const toName = (ref: string) => ref.slice('var('.length, -1);

const colorGroups: Record<string, (keyof typeof color)[]> = {
  'Backgrounds & surfaces': ['bg', 'bg-subtle', 'bg-muted', 'surface', 'surface-raised', 'overlay'],
  Text: ['text', 'text-muted', 'text-subtle', 'text-disabled', 'text-inverse'],
  Borders: ['border', 'border-strong', 'focus-ring'],
  Primary: [
    'primary',
    'primary-hover',
    'primary-active',
    'primary-subtle',
    'primary-text',
    'on-primary',
  ],
  Danger: ['danger', 'danger-hover', 'danger-active', 'danger-subtle', 'danger-text', 'on-danger'],
  Success: ['success', 'success-subtle', 'success-text', 'on-success'],
  Warning: ['warning', 'warning-subtle', 'warning-text', 'on-warning'],
  Info: ['info', 'info-subtle', 'info-text', 'on-info'],
};

export const Colors: Story = {
  render: () => (
    <div>
      {Object.entries(colorGroups).map(([group, keys]) => (
        <section key={group} aria-labelledby={`color-${group}`}>
          <h2 id={`color-${group}`} className={styles.heading}>
            {group}
          </h2>
          <div className={styles.grid}>
            {keys.map((key) => (
              <div key={key} className={styles.card}>
                <div className={styles.swatch} style={{ backgroundColor: color[key] }} />
                <code className={styles.name}>{toName(color[key])}</code>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div>
      {Object.entries(space).map(([key, value]) => (
        <div key={key} className={styles.row}>
          <code className={`${styles.name} ${styles.label}`}>{toName(value)}</code>
          <div className={styles.bar} style={{ inlineSize: value }} />
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div>
      <h2 className={styles.heading}>Font size</h2>
      {Object.entries(fontSize).map(([key, value]) => (
        <div key={key} className={styles.row}>
          <code className={`${styles.name} ${styles.label}`}>{toName(value)}</code>
          <span style={{ fontSize: value, lineHeight: lineHeight.tight }}>
            Design system — سیستم طراحی
          </span>
        </div>
      ))}
      <h2 className={styles.heading}>Font weight</h2>
      {Object.entries(fontWeight).map(([key, value]) => (
        <div key={key} className={styles.row}>
          <code className={`${styles.name} ${styles.label}`}>{toName(value)}</code>
          <span style={{ fontWeight: value }}>The quick brown fox — روباه قهوه‌ای چابک</span>
        </div>
      ))}
      <h2 className={styles.heading}>Line height</h2>
      {Object.entries(lineHeight).map(([key, value]) => (
        <div key={key} className={styles.row}>
          <code className={`${styles.name} ${styles.label}`}>{toName(value)}</code>
          <p style={{ lineHeight: value, margin: 0, maxInlineSize: '32rem' }}>
            طراحی خوب، نامرئی است. Good design is invisible — until it is missing, and then it is
            all anyone can see.
          </p>
        </div>
      ))}
    </div>
  ),
};

export const RadiusAndShadow: Story = {
  name: 'Radius & shadow',
  render: () => (
    <div>
      <h2 className={styles.heading}>Radius</h2>
      <div className={styles.grid}>
        {Object.entries(radius).map(([key, value]) => (
          <div key={key} className={styles.card}>
            <div className={styles.box} style={{ borderRadius: value }} />
            <code className={styles.name}>{toName(value)}</code>
          </div>
        ))}
      </div>
      <h2 className={styles.heading}>Shadow</h2>
      <div className={styles.grid}>
        {Object.entries(shadow).map(([key, value]) => (
          <div key={key} className={styles.card}>
            <div className={styles.box} style={{ boxShadow: value, borderRadius: radius.lg }} />
            <code className={styles.name}>{toName(value)}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};
