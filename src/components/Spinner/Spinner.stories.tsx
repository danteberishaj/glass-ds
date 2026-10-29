import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { Spinner, type SpinnerSize, type SpinnerTone } from './Spinner';

const sizes: SpinnerSize[] = ['sm', 'md', 'lg'];
const tones: SpinnerTone[] = ['accent', 'neutral', 'current'];

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { size: 'md', tone: 'accent', label: 'Loading' },
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    tone: { control: 'inline-radio', options: tones },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const grid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 24, alignItems: 'center' }}>
    {tones.flatMap((tone) => sizes.map((size) => <Spinner key={`${tone}-${size}`} tone={tone} size={size} />))}
  </div>
);

export const AllSizesAndTones: Story = { render: grid };

/**
 * `tone="current"` follows the button's text colour. The button's own text already says what is
 * happening, so the spinner is `aria-hidden` here to avoid a doubled name ("Saving Saving…").
 */
export const InButton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button variant="solid" disabled>
        <Spinner size="sm" tone="current" aria-hidden /> Saving…
      </Button>
      <Button disabled>
        <Spinner size="sm" tone="current" aria-hidden /> Loading
      </Button>
    </div>
  ),
};

export const OnPlainBackground: Story = { render: grid, parameters: { backdrop: 'plain' } };
