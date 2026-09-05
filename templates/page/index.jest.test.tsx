import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import <%= page.name %> from './<%= page.name %>';

describe('<<%= page.name %> />', () => {
  it('renders correctly', () => {
    const component = renderer.create(
      <MemoryRouter>
        <<%= page.name %> />
      </MemoryRouter>
    );
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
