import * as React from 'react';

import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';

export const PaperProviderContext = ({ children }: React.PropsWithChildren) => {
  return <PaperProvider theme={MD3LightTheme}>{children}</PaperProvider>;
};
