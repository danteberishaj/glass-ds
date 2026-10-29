import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { Alert, type AlertTone } from './Alert';

const tones: AlertTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];

/** Story-only icon; consumers bring their own icon set. */
const Icon = ({ tone }: { tone: AlertTone }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {tone === 'success' && <><circle cx="8" cy="8" r="6.25" /><path d="m5.5 8.25 1.75 1.75L10.75 6.5" /></>}
    {tone === 'warning' && <><path d="M8 1.75 14.75 13.5H1.25z" /><path d="M8 6.25v3M8 11.5v.01" /></>}
    {tone === 'danger' && <><circle cx="8" cy="8" r="6.25" /><path d="m5.75 5.75 4.5 4.5m0-4.5-4.5 4.5" /></>}
    {(tone === 'info' || tone === 'neutral') && <><circle cx="8" cy="8" r="6.25" /><path d="M8 7.25v3.5M8 5.25v.01" /></>}
  </svg>
);

const copy: Record<AlertTone, [string, string]> = {
  neutral: ['Heads up', 'You can change these settings later in your profile.'],
  info: ['New version available', 'Reload the page to get the latest features.'],
  success: ['Payment received', 'A receipt was sent to your email address.'],
  warning: ['Storage almost full', 'You have used 92% of your plan. Free up space or upgrade.'],
  danger: ['Upload failed', 'The file is larger than 25 MB. Choose a smaller file and try again.'],
};

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: { tone: 'info', title: copy.info[0], children: copy.info[1], icon: <Icon tone="info" /> },
  argTypes: { tone: { control: 'select', options: tones }, urgent: { control: 'boolean' } },
  decorators: [(Story) => <div style={{ width: 440, maxWidth: '100%' }}><Story /></div>],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const allTones = () => (
  <div style={{ display: 'grid', gap: 12 }}>
    {tones.map((tone) => (
      <Alert key={tone} tone={tone} title={copy[tone][0]} icon={<Icon tone={tone} />}>
        {copy[tone][1]}
      </Alert>
    ))}
  </div>
);

export const AllTones: Story = { render: allTones };
export const TitleOnly: Story = { args: { children: undefined, tone: 'success', title: 'Saved', icon: <Icon tone="success" /> } };
export const DescriptionOnly: Story = { args: { title: undefined, icon: undefined } };
/** `urgent` switches to role="alert" (assertive). Use sparingly. */
export const Urgent: Story = { args: { tone: 'danger', urgent: true, title: copy.danger[0], children: copy.danger[1], icon: <Icon tone="danger" /> } };
/** `action` is a trailing slot for one or two small buttons (Retry, Undo, Dismiss). */
export const WithAction: Story = {
  args: {
    tone: 'danger',
    title: copy.danger[0],
    children: copy.danger[1],
    icon: <Icon tone="danger" />,
    action: (
      <Button size="sm" variant="ghost">
        Retry
      </Button>
    ),
  },
};
export const OnPlainBackground: Story = { render: allTones, parameters: { backdrop: 'plain' } };
