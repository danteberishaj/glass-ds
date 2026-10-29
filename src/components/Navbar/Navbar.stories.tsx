import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { LogoMark, SearchIcon } from '../../../.storybook/icons';
import { SR_ONLY_CLASS } from '../../utils/sr-only';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Drawer, DrawerBody, DrawerClose, DrawerHeader, DrawerTitle } from '../Drawer';
import { Kbd } from '../Kbd';
import { Sidebar, SidebarGroup, SidebarItem, SidebarLink, SidebarNav } from '../Sidebar';
import {
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarItem,
  NavbarLink,
  NavbarMenuButton,
  NavbarNav,
  type NavbarProps,
} from './Navbar';

const links = ['Overview', 'Projects', 'Team', 'Billing'];

function Bar({ active = 'Overview', ...args }: NavbarProps & { active?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Navbar {...args}>
        <NavbarMenuButton open={open} onClick={() => setOpen(true)} aria-controls="navbar-drawer" />
        <NavbarBrand href="#home">
          <LogoMark />
          Prism
        </NavbarBrand>
        <NavbarNav>
          {links.map((link) => (
            <NavbarItem key={link}>
              <NavbarLink href={`#${link.toLowerCase()}`} active={link === active}>
                {link}
              </NavbarLink>
            </NavbarItem>
          ))}
        </NavbarNav>
        <NavbarActions>
          <Button variant="ghost" size="sm">
            <SearchIcon />
            <span className={SR_ONLY_CLASS}>Search</span>
            <Kbd size="sm">⌘K</Kbd>
          </Button>
          <Button variant="solid" size="sm">
            New project
          </Button>
          <Avatar alt="Ada Lovelace" size="sm" />
        </NavbarActions>
      </Navbar>
      <Drawer id="navbar-drawer" side="left" size="sm" open={open} onOpenChange={setOpen}>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <Sidebar surface="none">
            <SidebarNav aria-label="Mobile navigation">
              <SidebarGroup>
                {links.map((link) => (
                  <SidebarItem key={link}>
                    <SidebarLink href={`#${link.toLowerCase()}`} active={link === active} onClick={() => setOpen(false)}>
                      {link}
                    </SidebarLink>
                  </SidebarItem>
                ))}
              </SidebarGroup>
            </SidebarNav>
          </Sidebar>
        </DrawerBody>
        <DrawerClose />
      </Drawer>
    </>
  );
}

const meta = {
  title: 'Components/Navbar',
  component: Navbar,
  subcomponents: { NavbarBrand, NavbarNav, NavbarItem, NavbarLink, NavbarActions, NavbarMenuButton },
  args: { variant: 'floating', sticky: false, intensity: 'regular', collapseBelow: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['floating', 'attached'] },
    intensity: { control: 'inline-radio', options: ['subtle', 'regular', 'strong'] },
    collapseBelow: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'never'] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(1100px, 100%)', alignSelf: 'start' }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <Bar {...args} />,
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Floating: Story = {};

export const Attached: Story = { args: { variant: 'attached' } };

/** Narrow container: the links collapse into the menu button, which opens a Drawer with the same links. */
export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Open menu' });
    await expect(button).toBeVisible();
    await expect(canvas.queryByRole('navigation', { name: 'Main' })).toBeNull();
    await userEvent.click(button);
    // The drawer fades in from opacity 0, so wait for it rather than asserting the first frame.
    await waitFor(() => expect(within(document.body).getByRole('dialog', { name: 'Menu' })).toBeVisible());
  },
};

/** Scroll the frame: the bar stays pinned and the content blurs behind it. */
export const Sticky: Story = {
  args: { sticky: true },
  render: (args) => (
    <div style={{ height: 420, overflow: 'auto', borderRadius: 24 }}>
      <Bar {...args} />
      <div style={{ display: 'grid', gap: 16, padding: 24 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            style={{
              height: 80,
              borderRadius: 16,
              background: `linear-gradient(120deg, rgb(244 114 182 / .8), rgb(99 102 241 / .8))`,
              opacity: 1 - i * 0.05,
            }}
          />
        ))}
      </div>
    </div>
  ),
};

export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
