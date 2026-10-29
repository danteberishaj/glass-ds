// @vitest-environment node
/**
 * Guards Next.js / SSR compatibility: the public entry must import without `window`/`document`,
 * and every component must render to a string on the server. Add each new component here.
 */
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import * as gds from '../index';

describe('SSR', () => {
  it('imports the public entry without a DOM', () => {
    expect(typeof window).toBe('undefined');
    expect(Object.keys(gds).length).toBeGreaterThan(0);
  });

  it('renders surfaces, actions and forms', () => {
    const html = renderToString(
      <gds.Card>
        <gds.CardHeader>
          <gds.CardTitle>Title</gds.CardTitle>
          <gds.CardDescription>Description</gds.CardDescription>
        </gds.CardHeader>
        <gds.CardContent>
          <gds.Glass>Glass</gds.Glass>
          <gds.Separator decorative={false} />
          <gds.TextField label="Email" hint="Hint" />
          <gds.Textarea label="Message" hint="Hint" />
          <gds.Select label="Country" placeholder="Pick one">
            <option value="it">Italy</option>
          </gds.Select>
          <gds.Checkbox label="Accept" hint="Hint" indeterminate />
          <gds.RadioGroup label="Plan" defaultValue="a">
            <gds.Radio value="a" label="A" />
            <gds.Radio value="b" label="B" />
          </gds.RadioGroup>
          <gds.Switch label="Wi-Fi" defaultChecked />
          <gds.Slider label="Volume" defaultValue={30} showValue />
        </gds.CardContent>
        <gds.CardFooter>
          <gds.Button>Go</gds.Button>
        </gds.CardFooter>
      </gds.Card>,
    );
    expect(html).toContain('gds-glass');
    expect(html).toContain('<label');
    expect(html).toContain('type="range"');
    expect(html).toContain('role="switch"');
    expect(html).toContain('<fieldset');
  });

  it('renders data display and feedback', () => {
    const html = renderToString(
      <>
        <gds.Badge tone="success">Active</gds.Badge>
        <gds.AvatarGroup max={1}>
          <gds.Avatar alt="Ada Lovelace" src="/ada.png" />
          <gds.Avatar alt="Grace Hopper" />
        </gds.AvatarGroup>
        <gds.Kbd>K</gds.Kbd>
        <gds.Table>
          <gds.TableCaption>Caption</gds.TableCaption>
          <gds.TableHeader>
            <gds.TableRow>
              <gds.TableHead>Name</gds.TableHead>
            </gds.TableRow>
          </gds.TableHeader>
          <gds.TableBody>
            <gds.TableRow>
              <gds.TableCell>Ada</gds.TableCell>
            </gds.TableRow>
          </gds.TableBody>
        </gds.Table>
        <gds.Alert tone="info" title="Heads up">
          Body
        </gds.Alert>
        <gds.Progress value={40} label="Upload" />
        <gds.Spinner />
        <gds.Skeleton width={40} height={40} radius="full" />
      </>,
    );
    expect(html).toContain('aria-label="Ada Lovelace"');
    expect(html).toContain('+1');
    expect(html).toContain('<table');
    expect(html).toContain('role="progressbar"');
  });

  it('renders navigation, disclosure and overlays', () => {
    const html = renderToString(
      <>
        <gds.Tabs defaultValue="a">
          <gds.TabList aria-label="Sections">
            <gds.Tab value="a">A</gds.Tab>
            <gds.Tab value="b">B</gds.Tab>
          </gds.TabList>
          <gds.TabPanel value="a">Panel A</gds.TabPanel>
          <gds.TabPanel value="b">Panel B</gds.TabPanel>
        </gds.Tabs>
        <gds.Breadcrumb>
          <gds.BreadcrumbItem>
            <gds.BreadcrumbLink href="/">Home</gds.BreadcrumbLink>
          </gds.BreadcrumbItem>
          <gds.BreadcrumbSeparator />
          <gds.BreadcrumbItem>
            <gds.BreadcrumbPage>Here</gds.BreadcrumbPage>
          </gds.BreadcrumbItem>
        </gds.Breadcrumb>
        <gds.Pagination page={3} totalPages={10} getHref={(p) => `?page=${p}`} />
        <gds.Accordion>
          <gds.AccordionItem name="faq" defaultOpen>
            <gds.AccordionTrigger>Question</gds.AccordionTrigger>
            <gds.AccordionContent>Answer</gds.AccordionContent>
          </gds.AccordionItem>
        </gds.Accordion>
        <gds.Dialog open>
          <gds.DialogClose />
          <gds.DialogHeader>
            <gds.DialogTitle>Dialog</gds.DialogTitle>
            <gds.DialogDescription>Description</gds.DialogDescription>
          </gds.DialogHeader>
          <gds.DialogBody>Body</gds.DialogBody>
          <gds.DialogFooter>
            <gds.DialogClose>Cancel</gds.DialogClose>
          </gds.DialogFooter>
        </gds.Dialog>
        <gds.Drawer side="left">
          <gds.DrawerHeader>
            <gds.DrawerTitle>Drawer</gds.DrawerTitle>
          </gds.DrawerHeader>
          <gds.DrawerBody>Body</gds.DrawerBody>
        </gds.Drawer>
      </>,
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain('Panel B'); // inactive panels stay in the HTML
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('<details');
    expect(html).toContain('<dialog');
    // Dialogs open in an effect (showModal), never via the SSR `open` attribute.
    expect(html).not.toMatch(/<dialog[^>]*\sopen/);
  });

  it('renders date inputs', () => {
    const day = new Date(2026, 9, 29, 12);
    const html = renderToString(
      <>
        <gds.Calendar locale="en-US" defaultValue={day} aria-label="Inline" />
        <gds.DatePicker label="Start" locale="en-US" name="start" defaultValue={day} hint="Hint" />
        <gds.DatePicker label="Empty" />
      </>,
    );
    expect(html).toContain('role="grid"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('popover="auto"');
    expect(html).toMatch(/popovertarget="[^"]+-popover"/i); // React writes `popoverTarget`; HTML lowercases it
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('type="hidden" name="start" value="2026-10-29"');
    expect(html).toContain('Oct 29, 2026');
    // "today" depends on the client clock and positioning runs in effects, so neither is in the HTML.
    expect(html).not.toContain('aria-current="date"');
    expect(html).not.toContain('data-placement');
  });

  it('renders app-shell navigation', () => {
    const html = renderToString(
      <gds.AppShell
        header={
          <gds.Navbar sticky>
            <gds.NavbarMenuButton />
            <gds.NavbarBrand href="/">Prism</gds.NavbarBrand>
            <gds.NavbarNav>
              <gds.NavbarItem>
                <gds.NavbarLink href="/" active>
                  Overview
                </gds.NavbarLink>
              </gds.NavbarItem>
            </gds.NavbarNav>
            <gds.NavbarActions>Actions</gds.NavbarActions>
          </gds.Navbar>
        }
        sidebar={
          <gds.Sidebar collapsed>
            <gds.SidebarHeader>
              <gds.SidebarToggle collapsed />
            </gds.SidebarHeader>
            <gds.SidebarContent>
              <gds.SidebarNav>
                <gds.SidebarGroup label="Workspace">
                  <gds.SidebarItem>
                    <gds.SidebarLink href="/inbox" icon={<svg />} active>
                      Inbox
                    </gds.SidebarLink>
                  </gds.SidebarItem>
                </gds.SidebarGroup>
              </gds.SidebarNav>
            </gds.SidebarContent>
            <gds.SidebarSeparator />
            <gds.SidebarFooter>Footer</gds.SidebarFooter>
          </gds.Sidebar>
        }
      >
        Page
      </gds.AppShell>,
    );
    expect(html).toContain('<header');
    expect(html).toContain('<aside');
    expect(html).toContain('<main id="main-content"');
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Workspace"');
  });
});
