import { withKnobs } from '@storybook/addon-knobs';
import { configure, addDecorator } from '@storybook/react';

import '../src/index.scss';

function loadStories() {
  const req = require.context('../src/components', true, /\.stories\.js$/);

  req.keys().forEach(filename => req(filename));
}

addDecorator(withKnobs);

configure(loadStories, module);
