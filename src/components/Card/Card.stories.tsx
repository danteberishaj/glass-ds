import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  subcomponents: { CardHeader, CardTitle, CardDescription, CardContent, CardFooter },
  args: { intensity: 'regular', interactive: false, style: { width: 360 } },
  argTypes: { intensity: { control: 'inline-radio', options: ['subtle', 'regular', 'strong'] } },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Upgrade your plan</CardTitle>
        <CardDescription>Unlock unlimited projects and priority support.</CardDescription>
      </CardHeader>
      <CardContent>Billed yearly. Cancel any time.</CardContent>
      <CardFooter>
        <Button variant="ghost">Later</Button>
        <Button variant="solid">Upgrade</Button>
      </CardFooter>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Strong: Story = { args: { intensity: 'strong', elevation: 'raised' } };
/** Hover (or tab into) the card: it lifts onto the raised shadow and a sheen sweeps across. */
export const Interactive: Story = {
  args: { interactive: true },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>
          <a href="#pricing" style={{ color: 'inherit' }}>
            Pro plan
          </a>
        </CardTitle>
        <CardDescription>Hover or focus the link to see the card respond.</CardDescription>
      </CardHeader>
      <CardContent>Unlimited projects, priority support, SSO.</CardContent>
    </Card>
  ),
};

export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
