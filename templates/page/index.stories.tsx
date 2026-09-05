import type { Meta, StoryObj } from '@storybook/react-vite';

import <%= page.name %> from './<%= page.name %>';

const meta = {
  title: 'Pages/<%= page.name %>',
  component: <%= page.name %>
} satisfies Meta<typeof <%= page.name %>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
