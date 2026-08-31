import type { Meta, StoryObj } from '@storybook/react-vite';

import <%= component.name %> from './<%= component.name %>';

const meta = {
  title: 'Components/<%= component.name %>',
  component: <%= component.name %>
} satisfies Meta<typeof <%= component.name %>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
