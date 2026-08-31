import type { Meta, StoryObj } from '@storybook/react-vite';

import SuspenseFallback from './SuspenseFallback';

const meta = {
  title: 'Components/SuspenseFallback',
  component: SuspenseFallback,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof SuspenseFallback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
