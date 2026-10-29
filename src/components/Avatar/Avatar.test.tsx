import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Avatar, getInitials } from './Avatar';
import { AvatarGroup } from './AvatarGroup';

describe('Avatar', () => {
  it('derives initials', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('  plato ')).toBe('P');
    expect(getInitials('Ada King Lovelace')).toBe('AL');
    expect(getInitials('')).toBe('');
  });

  it('is named by alt and shows initials without src', () => {
    const { container } = render(<Avatar alt="Ada Lovelace" />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders the image, then falls back to initials when it fails', () => {
    const { container } = render(<Avatar alt="Ada Lovelace" src="/ada.png" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/ada.png');
    expect(img).toHaveAttribute('data-status', 'loading');
    fireEvent.error(img!);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
  });

  it('marks the image loaded and retries when src changes', () => {
    const { container, rerender } = render(<Avatar alt="Ada" src="/a.png" />);
    fireEvent.error(container.querySelector('img')!);
    rerender(<Avatar alt="Ada" src="/b.png" />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('src', '/b.png');
    fireEvent.load(img);
    expect(img).toHaveAttribute('data-status', 'loaded');
  });

  it('uses a custom fallback, forwards ref and merges className', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} alt="Team" fallback="T!" className="custom" />);
    expect(screen.getByText('T!')).toBeInTheDocument();
    expect(ref.current).toHaveClass('custom', 'gds-glass');
  });

  it('hides itself from assistive tech when alt is empty', () => {
    const { container } = render(<Avatar alt="" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Avatar alt="Ada Lovelace" src="/ada.png" />
        <Avatar alt="Grace Hopper" />
        <Avatar alt="" />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});

describe('AvatarGroup', () => {
  const people = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Linus Torvalds'];

  it('limits to max and adds a +N chip with an accessible name', () => {
    render(
      <AvatarGroup max={3}>
        {people.map((name) => <Avatar key={name} alt={name} />)}
      </AvatarGroup>,
    );
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getByRole('img', { name: '2 more' })).toHaveTextContent('+2');
    expect(screen.queryByRole('img', { name: 'Linus Torvalds' })).toBeNull();
  });

  it('passes size to avatars that do not set one', () => {
    render(
      <AvatarGroup size="lg">
        <Avatar alt="Ada" />
        <Avatar alt="Grace" size="sm" />
      </AvatarGroup>,
    );
    expect(screen.getByRole('img', { name: 'Ada' })).toHaveAttribute('data-size', 'lg');
    expect(screen.getByRole('img', { name: 'Grace' })).toHaveAttribute('data-size', 'sm');
  });

  it('supports a custom overflow label and has no a11y violations', async () => {
    const { container } = render(
      <AvatarGroup role="group" aria-label="Members" max={2} overflowLabel={(n) => `${n} other members`}>
        {people.map((name) => <Avatar key={name} alt={name} />)}
      </AvatarGroup>,
    );
    expect(screen.getByRole('img', { name: '3 other members' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
