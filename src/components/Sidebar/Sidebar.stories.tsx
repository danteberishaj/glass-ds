import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { DemoSidebar } from '../../../.storybook/demo-sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarSeparator,
  SidebarToggle,
} from './Sidebar';

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  subcomponents: { SidebarHeader, SidebarContent, SidebarFooter, SidebarNav, SidebarGroup, SidebarItem, SidebarLink, SidebarSeparator, SidebarToggle },
  args: { collapsed: false, side: 'left', variant: 'floating', intensity: 'regular' },
  argTypes: {
    side: { control: 'inline-radio', options: ['left', 'right'] },
    variant: { control: 'inline-radio', options: ['floating', 'attached'] },
    intensity: { control: 'inline-radio', options: ['subtle', 'regular', 'strong'] },
  },
  decorators: [
    (Story) => (
      <div style={{ height: 620, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <DemoSidebar {...args} />,
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Collapsed: Story = { args: { collapsed: true } };

/** Click the chevron: the width springs between the full sidebar and the icon rail. */
export const Collapsible: Story = {
  render: function Render(args) {
    const [collapsed, setCollapsed] = useState(false);
    return <DemoSidebar {...args} collapsed={collapsed} onCollapsedChange={() => setCollapsed((c) => !c)} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
    const expand = canvas.getByRole('button', { name: 'Expand sidebar' });
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    // Labels are visually hidden but still name the links.
    await expect(canvas.getByRole('link', { name: 'Analytics' })).toBeInTheDocument();
  },
};

export const Strong: Story = { args: { intensity: 'strong' } };
export const RightSide: Story = {
  render: function Render(args) {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: 640 }}>
        <DemoSidebar {...args} side="right" collapsed={collapsed} onCollapsedChange={() => setCollapsed((c) => !c)} />
      </div>
    );
  },
};
export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
