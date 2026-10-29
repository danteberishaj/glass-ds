import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DemoSidebar } from '../../../.storybook/demo-sidebar';
import { LogoMark, SearchIcon } from '../../../.storybook/icons';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../Breadcrumb';
import { Button } from '../Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Card';
import { Drawer, DrawerBody, DrawerClose, DrawerHeader, DrawerTitle } from '../Drawer';
import { Navbar, NavbarActions, NavbarBrand, NavbarItem, NavbarLink, NavbarMenuButton, NavbarNav } from '../Navbar';
import { Progress } from '../Progress';
import { AppShell, type AppShellProps } from './AppShell';

const stats = [
  { title: 'Revenue', value: '$48,210', delta: '+12.4%', tone: 'success' as const },
  { title: 'Active users', value: '3,982', delta: '+4.1%', tone: 'success' as const },
  { title: 'Churn', value: '1.8%', delta: '+0.3%', tone: 'warning' as const },
];

function Page() {
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 1100 }}>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Workspace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <h1 style={{ margin: 0, fontSize: 30 }}>Good morning, Ada</h1>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {stats.map((s) => (
          <Card key={s.title} interactive>
            <CardHeader>
              <CardDescription>{s.title}</CardDescription>
              <CardTitle as="h2" style={{ fontSize: 28 }}>
                {s.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge tone={s.tone}>{s.delta}</Badge> vs last month
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle as="h2">Quarterly goal</CardTitle>
          <CardDescription>68% of the Q4 target reached with 9 weeks to go.</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={68} label="Q4 target" showValue />
        </CardContent>
      </Card>
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i} intensity="subtle">
          <CardContent>Scroll to see the sticky glass header and sidebar blur the content behind them.</CardContent>
        </Card>
      ))}
    </div>
  );
}

function Shell(args: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <AppShell
        {...args}
        sidebar={<DemoSidebar collapsed={collapsed} onCollapsedChange={() => setCollapsed((c) => !c)} />}
        header={
          <Navbar variant="attached" intensity="subtle">
            <NavbarMenuButton open={menuOpen} onClick={() => setMenuOpen(true)} />
            {args.layout === 'header-first' && (
              <NavbarBrand href="#home">
                <LogoMark />
                Prism
              </NavbarBrand>
            )}
            <NavbarNav aria-label="Sections">
              <NavbarItem>
                <NavbarLink href="#overview" active>
                  Overview
                </NavbarLink>
              </NavbarItem>
              <NavbarItem>
                <NavbarLink href="#reports">Reports</NavbarLink>
              </NavbarItem>
            </NavbarNav>
            <NavbarActions>
              <Button variant="ghost" size="sm" aria-label="Search">
                <SearchIcon />
              </Button>
              <Avatar alt="Ada Lovelace" size="sm" />
            </NavbarActions>
          </Navbar>
        }
      >
        <Page />
      </AppShell>
      <Drawer side="left" size="sm" open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerClose />
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <DemoSidebar surface="none" aria-label="Mobile menu" />
        </DrawerBody>
      </Drawer>
    </>
  );
}

const meta = {
  title: 'Patterns/AppShell',
  component: AppShell,
  args: { layout: 'sidebar-first', sidebarBreakpoint: 'md' },
  argTypes: {
    layout: { control: 'inline-radio', options: ['sidebar-first', 'header-first'] },
    sidebarBreakpoint: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'never'] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'calc(100% + 96px)', alignSelf: 'stretch', justifySelf: 'stretch', margin: -48 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <Shell {...args} />,
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {};
export const HeaderFirst: Story = { args: { layout: 'header-first' } };
