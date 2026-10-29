import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentPropsWithRef } from 'react';
import { Glass } from '../Glass';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  type BreadcrumbProps,
} from './Breadcrumb';

function Trail(props: BreadcrumbProps) {
  return (
    <Breadcrumb {...props}>
      <BreadcrumbItem>
        <BreadcrumbLink href="#home">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="#aurora">Aurora</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Settings</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  subcomponents: { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis },
  render: (args) => <Trail {...args} />,
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SlashSeparator: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem>
        <BreadcrumbLink href="#home">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbLink href="#docs">Docs</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const Collapsed: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem>
        <BreadcrumbLink href="#home">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbEllipsis />
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="#components">Components</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

/** `as` renders a router link (e.g. next/link) with the breadcrumb styles. */
export const WithRouterLink: Story = {
  render: (args) => {
    function FakeRouterLink(props: ComponentPropsWithRef<'a'>) {
      return <a {...props} onClick={(e) => e.preventDefault()} />;
    }
    return (
      <Breadcrumb {...args}>
        <BreadcrumbItem>
          <BreadcrumbLink as={FakeRouterLink} href="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Account</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
    );
  },
};

/** Typical placement: inside a glass header bar. */
export const InGlassBar: Story = {
  render: (args) => (
    <Glass intensity="strong" radius="xl" style={{ padding: '12px 20px' }}>
      <Trail {...args} />
    </Glass>
  ),
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <Trail {...args} />
    </div>
  ),
};

export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
