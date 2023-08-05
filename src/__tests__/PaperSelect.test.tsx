import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProviderContext } from '../testUtils';

import { PaperSelect } from '../PaperSelect';

describe('<PaperSelect />', () => {
  it('should match snapshot', () => {
    render(<PaperSelect />, { wrapper: PaperProviderContext });

    expect(screen).toMatchSnapshot();
  });

  it('should exist in the DOM', async () => {
    render(<PaperSelect />, { wrapper: PaperProviderContext });

    const component = await screen.findByRole('combobox');

    expect(component).toBeDefined();
  });
});
