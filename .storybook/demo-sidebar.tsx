/* Storybook-only: the demo sidebar shared by the Sidebar, Navbar and AppShell stories. */
import type { ReactNode } from 'react';
import { Avatar } from '../src/components/Avatar';
import { Badge } from '../src/components/Badge';
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
  type SidebarProps,
} from '../src/components/Sidebar';
import { ChartIcon, FolderIcon, HelpIcon, HomeIcon, InboxIcon, LogoMark, SettingsIcon, UsersIcon } from './icons';

const brandStyle = { display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, whiteSpace: 'nowrap' } as const;

export function DemoSidebar({
  id = 'demo-sidebar',
  active = 'Dashboard',
  navLabel,
  onCollapsedChange,
  ...args
}: SidebarProps & { active?: string; navLabel?: string; onCollapsedChange?: () => void }) {
  const link = (label: string, icon: ReactNode, badge?: ReactNode) => (
    <SidebarItem>
      <SidebarLink href={`#${label.toLowerCase()}`} icon={icon} badge={badge} active={label === active}>
        {label}
      </SidebarLink>
    </SidebarItem>
  );
  return (
    <Sidebar id={id} {...args}>
      <SidebarHeader>
        <span style={brandStyle}>
          <LogoMark />
          {!args.collapsed && 'Prism'}
        </span>
        {onCollapsedChange && <SidebarToggle collapsed={args.collapsed} onClick={onCollapsedChange} aria-controls={id} />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav aria-label={navLabel}>
          <SidebarGroup label="Workspace">
            {link('Dashboard', <HomeIcon />)}
            {link('Analytics', <ChartIcon />)}
            {link('Inbox', <InboxIcon />, <Badge size="sm" variant="solid" tone="accent">12</Badge>)}
            {link('Projects', <FolderIcon />)}
          </SidebarGroup>
          <SidebarGroup label="Organization">
            {link('Team', <UsersIcon />)}
            {link('Settings', <SettingsIcon />)}
          </SidebarGroup>
        </SidebarNav>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarLink as="button" icon={<HelpIcon />}>
          Help & feedback
        </SidebarLink>
      </SidebarFooter>
      <SidebarFooter>
        <Avatar alt="Ada Lovelace" size="sm" />
        {!args.collapsed && (
          <span style={{ display: 'grid', fontSize: 13, lineHeight: 1.3, minWidth: 0 }}>
            <strong>Ada Lovelace</strong>
            <span style={{ color: 'var(--gds-text-secondary)' }}>ada@prism.dev</span>
          </span>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

