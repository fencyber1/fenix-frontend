import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('humanizes a status code', () => {
    render(<StatusBadge status="BANK_TRANSFER" />);
    expect(screen.getByText('bank transfer')).toBeInTheDocument();
  });
  it('renders children when provided', () => {
    render(<StatusBadge tone="success">95%</StatusBadge>);
    expect(screen.getByText('95%')).toBeInTheDocument();
  });
});
