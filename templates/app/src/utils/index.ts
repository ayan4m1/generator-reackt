<% if (testFramework === 'jest') { %>
import { createElement, type ReactNode } from 'react';

/**
 * Creates a mock component which will expose its props for snapshot testing purposes.
 *
 * @param {string} name The component/element name (e.g. "MyComponent")
 * @param {object} props An object containing props to set
 * @return {object} Mock component with specified name and props
 */
export const mockComponent =
  (name: string, props: Record<string, unknown> = {}) =>
  () =>
    createElement(name, props, props.children as ReactNode);
<% } %>

<% if (flags.addRedux) { %>
/* eslint-disable react/display-name, react/prop-types */

/**
 * Creates an object containing action constants namespaced under the specified reducer.
 *
 * @param {string} reducer The name of the reducer or module
 * @param {string[]} actions A list of action names
 * @return {object} Object with action name keys and full action string values
 */
export function buildActions<T extends string>(
  reducer: string,
  actions: readonly T[]
) {
  const result = {} as Record<T, string>;

  for (const action of actions) {
    result[action] = `${reducer}/${action}`;
  }

  return result;
}
<% } %>
