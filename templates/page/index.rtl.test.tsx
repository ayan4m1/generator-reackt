import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import <%= page.name %> from './<%= page.name %>';

describe('<<%= page.name %> />', () => {
  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <<%= page.name %> />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
