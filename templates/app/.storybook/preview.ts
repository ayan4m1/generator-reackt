<% if (styleFramework === 'bootstrap') { %>
import { withThemeByDataAttribute } from '@storybook/addon-themes';
<% } else { %>
import { withThemeByClassName } from '@storybook/addon-themes';
<% } %>
import type { Preview } from '@storybook/react-vite';

import '../src/index.scss';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|bg|color)$/i,
        date: /date$/i
      }
    }
  },
  decorators: [
<% if (styleFramework === 'bootstrap') { %>
    withThemeByDataAttribute({
      attributeName: 'data-bs-theme',
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light'
    })
<% } else { %>
    withThemeByClassName({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light'
    })
<% } %>
  ],
  tags: ['autodocs']
};

export default preview;
