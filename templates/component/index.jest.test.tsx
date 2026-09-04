import renderer from 'react-test-renderer';

import <%=component.name %> from './<%=component.name %>';

describe('<<%= component.name %> />', () => {
  it('renders correctly', () => {
    const component = renderer.create(
      <<%=component.name %> />
    );
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
