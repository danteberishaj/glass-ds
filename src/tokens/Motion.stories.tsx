import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/Accordion';
import { Button } from '../components/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Checkbox } from '../components/Checkbox';
import { Progress } from '../components/Progress';
import { Radio, RadioGroup } from '../components/RadioGroup';
import { Slider } from '../components/Slider';
import { Spinner } from '../components/Spinner';
import { Switch } from '../components/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../components/Tabs';
import styles from './Motion.module.css';

/** Each easing token next to the duration it is meant to be paired with. */
const easings = [
  { name: 'spring-snappy', duration: 'spring-snappy', use: 'Enter: dialogs, tab indicator, chevrons' },
  { name: 'spring-bounce', duration: 'spring-bounce', use: 'Playful confirmation: press release, switch, radio' },
  { name: 'spring-gentle', duration: 'spring-gentle', use: 'Large surfaces: drawers, accordion height, progress' },
  { name: 'out', duration: 'normal', use: 'Exit, fades, focus rings' },
  { name: 'standard', duration: 'normal', use: 'Colour and background changes' },
  { name: 'emphasized', duration: 'slow', use: 'Rare: an overshooting cubic-bezier' },
] as const;

function EasingDemo() {
  const [played, setPlayed] = useState(false);
  return (
    <div className={styles.demo} data-played={played || undefined}>
      <div>
        <Button variant="solid" onClick={() => setPlayed((p) => !p)}>
          {played ? 'Play back' : 'Play'}
        </Button>
      </div>
      {easings.map((e) => (
        <div key={e.name} className={styles.row}>
          <div className={styles.name}>
            <strong>{e.name}</strong>
            <code>
              --gds-easing-{e.name} · --gds-duration-{e.duration}
            </code>
          </div>
          <div className={styles.track} title={e.use}>
            <div
              className={styles.box}
              style={
                {
                  '--_duration': `var(--gds-duration-${e.duration})`,
                  '--_easing': `var(--gds-easing-${e.name})`,
                } as CSSProperties
              }
            />
          </div>
        </div>
      ))}
      <p className={styles.note}>With reduced motion turned on in your OS, the boxes jump instead of moving.</p>
    </div>
  );
}

function Playground() {
  const [progress, setProgress] = useState(30);
  return (
    <div className={styles.playground}>
      <div className={styles.cluster}>
        <Button>Glass (hover: lift + sheen)</Button>
        <Button variant="solid" onClick={() => setProgress((p) => (p >= 100 ? 10 : p + 30))}>
          Advance progress
        </Button>
        <Button variant="ghost">Ghost</Button>
        <Spinner />
      </div>
      <Progress label="Upload" value={progress} showValue />
      <Progress label="Preparing" value={null} />
      <div className={styles.cluster}>
        <Switch label="Wi-Fi" defaultChecked />
        <Checkbox label="Remember me" />
        <RadioGroup label="Plan" defaultValue="pro" orientation="horizontal">
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" />
        </RadioGroup>
      </div>
      <Slider label="Volume" defaultValue={40} />
      <Tabs defaultValue="one">
        <TabList aria-label="Demo tabs">
          <Tab value="one">Overview</Tab>
          <Tab value="two">A longer tab</Tab>
          <Tab value="three">Settings</Tab>
        </TabList>
        <TabPanel value="one">The indicator slides and resizes between tabs.</TabPanel>
        <TabPanel value="two">Panels rise 4px and fade in.</TabPanel>
        <TabPanel value="three">Panels holding glass rise without fading.</TabPanel>
      </Tabs>
      <Accordion style={{ maxInlineSize: 480 }}>
        <AccordionItem>
          <AccordionTrigger>What springs back?</AccordionTrigger>
          <AccordionContent>The chevron, on the snappy spring. The height opens on the gentle one.</AccordionContent>
        </AccordionItem>
      </Accordion>
      <Card interactive style={{ maxInlineSize: 360 }}>
        <CardHeader>
          <CardTitle>Interactive card</CardTitle>
          <CardDescription>Hover: lift, raised shadow and a sheen.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

const meta = {
  title: 'Foundations/Motion',
  // The MDX page (Motion.mdx) is this component's docs.
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every easing token on its paired duration. Click Play. */
export const Easings: Story = { render: () => <EasingDemo /> };

/** The motion in context: hover, press and toggle the controls. */
export const InContext: Story = { render: () => <Playground /> };
