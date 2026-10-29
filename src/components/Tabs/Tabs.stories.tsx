import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Card, CardDescription, CardHeader, CardTitle } from '../Card';
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from './Tabs';

const sections = [
  { value: 'overview', label: 'Overview', body: 'Traffic is up 12% week over week. Most visits come from organic search.' },
  { value: 'analytics', label: 'Analytics', body: 'Median session length is 4m 12s across 18,240 sessions.' },
  { value: 'reports', label: 'Reports', body: 'Three scheduled reports run every Monday at 09:00.' },
  { value: 'settings', label: 'Settings', body: 'Notification and data retention preferences for this workspace.' },
];

function Example(props: TabsProps) {
  return (
    <Tabs defaultValue="overview" {...props}>
      <TabList aria-label="Dashboard sections">
        {sections.map((s) => (
          <Tab key={s.value} value={s.value}>
            {s.label}
          </Tab>
        ))}
      </TabList>
      {sections.map((s) => (
        <TabPanel key={s.value} value={s.value}>
          <Card intensity="strong">
            <CardHeader>
              <CardTitle>{s.label}</CardTitle>
              <CardDescription>{s.body}</CardDescription>
            </CardHeader>
          </Card>
        </TabPanel>
      ))}
    </Tabs>
  );
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  subcomponents: { TabList, Tab, TabPanel },
  args: {
    variant: 'glass',
    size: 'md',
    orientation: 'horizontal',
    activationMode: 'automatic',
    onValueChange: fn(),
    style: { width: 480 },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['glass', 'underline'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    activationMode: { control: 'inline-radio', options: ['automatic', 'manual'] },
  },
  render: (args) => <Example {...args} />,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Glass: Story = {};
export const Underline: Story = { args: { variant: 'underline' } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 32 }}>
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} style={{ display: 'grid', gap: 16 }}>
          <Example {...args} size={size} />
          <Example {...args} size={size} variant="underline" />
        </div>
      ))}
    </div>
  ),
};

export const Vertical: Story = { args: { orientation: 'vertical', style: { width: 560 } } };
export const VerticalUnderline: Story = {
  args: { orientation: 'vertical', variant: 'underline', style: { width: 560 } },
};

export const WithDisabledTab: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="free">
      <TabList aria-label="Plans">
        <Tab value="free">Free</Tab>
        <Tab value="pro">Pro</Tab>
        <Tab value="enterprise" disabled>
          Enterprise
        </Tab>
      </TabList>
      <TabPanel value="free">Up to 3 projects.</TabPanel>
      <TabPanel value="pro">Unlimited projects and priority support.</TabPanel>
      <TabPanel value="enterprise">Contact sales.</TabPanel>
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('analytics');
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <Example
          {...args}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            args.onValueChange?.(next);
          }}
        />
        <p style={{ margin: 0, fontSize: 14 }}>
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};

export const ManualActivation: Story = { args: { activationMode: 'manual' } };

export const KeyboardNavigation: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    await userEvent.click(overview);
    await userEvent.keyboard('{ArrowRight}');
    const analytics = canvas.getByRole('tab', { name: 'Analytics' });
    await expect(analytics).toHaveFocus();
    await expect(analytics).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('analytics');
    await expect(canvas.getByRole('tabpanel')).toHaveAccessibleName('Analytics');
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(overview).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(overview).toHaveAttribute('aria-selected', 'true');
  },
};

export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
export const UnderlineOnPlainBackground: Story = {
  args: { variant: 'underline' },
  parameters: { backdrop: 'plain' },
};
