import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  Text,
} from 'react-native-paper';

import { PaperSelect } from 'react-native-paper-select';

export const App = () => {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <View style={styles.screen}>
        <SimpleExample />
      </View>
    </PaperProvider>
  );
};

export default App;

const simpleOptions = ['one', 'two', 'three'];

const SimpleExample = () => {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);

  return (
    <View style={styles.example}>
      <Text variant="headlineMedium">Simple Example</Text>

      <PaperSelect
        options={simpleOptions}
        value={selected}
        onSelection={(value) => setSelected(value)}
      />

      <Text>Selected value: {selected}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  example: {
    flexShrink: 1,
    alignItems: 'stretch',
    marginBottom: 16,
  },
});
