import { render, screen } from '@testing-library/react';

import <%= component.name %> from './<%= component.name %>';

describe('<<%= component.name %> />', () => {
  it('renders correctly', () => {
    render(<<%= component.name %> />);

    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
