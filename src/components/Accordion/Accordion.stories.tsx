import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion';

const faqs = [
  {
    q: 'What is glassmorphism?',
    a: 'A style built from translucent, blurred surfaces layered over a rich background, with soft borders and highlights.',
  },
  {
    q: 'Does it work without JavaScript?',
    a: 'Yes. The accordion is native details and summary, so it opens, closes and is found by find-in-page before hydration.',
  },
  {
    q: 'How do I allow only one open section?',
    a: 'Give every AccordionItem the same name. The browser closes the others when one opens.',
  },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem, AccordionTrigger, AccordionContent },
  args: { intensity: 'regular', style: { width: 420 } },
  argTypes: { intensity: { control: 'inline-radio', options: ['subtle', 'regular', 'strong'] } },
  render: (args) => (
    <Accordion {...args}>
      {faqs.map((f) => (
        <AccordionItem key={f.q}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent>{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Several sections can be open at once. */
export const Multiple: Story = {};

/** Same `name` on each item: opening one closes the others (native exclusive accordion). */
export const Single: Story = {
  render: (args) => (
    <Accordion {...args}>
      {faqs.map((f) => (
        <AccordionItem key={f.q} name="faq">
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent>{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByText('What is glassmorphism?');
    const second = canvas.getByText('Does it work without JavaScript?');
    await userEvent.click(first);
    await expect(first.closest('details')).toHaveAttribute('open');
    await userEvent.click(second);
    await expect(second.closest('details')).toHaveAttribute('open');
    await expect(first.closest('details')).not.toHaveAttribute('open');
  },
};

export const DefaultOpen: Story = {
  render: (args) => (
    <Accordion {...args}>
      {faqs.map((f, i) => (
        <AccordionItem key={f.q} defaultOpen={i === 0}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent>{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Strong: Story = { args: { intensity: 'strong' } };

export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
