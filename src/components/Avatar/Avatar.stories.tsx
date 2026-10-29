import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, type AvatarSize } from './Avatar';
import { AvatarGroup } from './AvatarGroup';

const sizes: AvatarSize[] = ['sm', 'md', 'lg', 'xl'];

/** Self-contained demo "photo" (no network): a soft gradient portrait placeholder. */
const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f472b6"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="#fff" fill-opacity=".85"/><path d="M12 60c2-12 10-18 20-18s18 6 20 18z" fill="#fff" fill-opacity=".85"/></svg>`,
)}`;

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  subcomponents: { AvatarGroup },
  args: { alt: 'Ada Lovelace', size: 'md', src: photo },
  argTypes: { size: { control: 'inline-radio', options: sizes } },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Initials: Story = { args: { src: undefined } };
/** The image URL 404s, so the initials take over. */
export const BrokenImage: Story = { args: { src: '/does-not-exist.png', alt: 'Grace Hopper' } };

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 16, alignItems: 'center' }}>
      {sizes.map((size) => <Avatar key={`p-${size}`} {...args} size={size} />)}
      {sizes.map((size) => <Avatar key={`i-${size}`} {...args} src={undefined} size={size} />)}
    </div>
  ),
};

export const Group: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {sizes.map((size) => (
        <AvatarGroup key={size} size={size} max={4} role="group" aria-label="Project members">
          <Avatar src={args.src} alt="Ada Lovelace" />
          <Avatar alt="Grace Hopper" />
          <Avatar src={args.src} alt="Alan Turing" />
          <Avatar alt="Katherine Johnson" />
          <Avatar alt="Linus Torvalds" />
          <Avatar alt="Margaret Hamilton" />
        </AvatarGroup>
      ))}
    </div>
  ),
};

export const OnPlainBackground: Story = { render: AllSizes.render, parameters: { backdrop: 'plain' } };
