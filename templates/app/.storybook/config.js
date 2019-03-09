import { join } from 'path';
import { configure } from '@storybook/react';

import '../src/index.scss';

function loadStories() {
  const dir = join(__dirname, '..', 'src', 'stories');
  const req = require.context(dir, true, /\.stories\.js$/);
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
