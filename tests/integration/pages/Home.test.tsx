import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Home from '../../../src/pages/Home';

describe('Home page', () => {
  it('renders app title and navigation links', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'MusicScan' })).toBeInTheDocument();

    const generateLink = screen.getByRole('link', {
      name: /Generate Cards/i,
    });
    const scanLink = screen.getByRole('link', {
      name: /Scan Card/i,
    });

    expect(generateLink).toHaveAttribute('href', '/generate');
    expect(scanLink).toHaveAttribute('href', '/scan');
  });
});
