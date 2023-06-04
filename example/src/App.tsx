import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  Text,
  SegmentedButtons,
} from 'react-native-paper';

import { PaperSelect } from '@rcarls/react-native-paper-select';

export const App = () => {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <View style={styles.screen}>
        <SimpleExample />
        <ControlledExample />
        <Example2 />
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
        label="Example"
        options={simpleOptions}
        onSelection={(value) => setSelected(value)}
      />

      <Text>Selected value: {selected}</Text>
    </View>
  );
};

const ControlledExample = () => {
  const [selected, setSelected] = React.useState<string>(simpleOptions[0]!!);

  return (
    <View style={styles.example}>
      <Text variant="headlineMedium">Example (as controlled input)</Text>

      <SegmentedButtons
        buttons={simpleOptions.map((option) => ({
          value: option,
          label: option,
        }))}
        value={selected}
        onValueChange={setSelected}
        style={{ marginVertical: 16 }}
      />

      <PaperSelect
        label="Example"
        options={simpleOptions}
        value={selected}
        noneOption={false}
        onSelection={(option) => option && setSelected(option)}
      />

      <Text>Selected value: {selected}</Text>
    </View>
  );
};

const example2Options = [
  { id: 'e637939a-cf3e-45c4-a57c-0b2cf4f03d92', text: 'Option 1' },
  { id: 'c4d81412-e97e-481e-8f15-7fabc28ff154', text: 'Option 2' },
  { id: 'd848ec93-a112-4897-a092-01145b17702e', text: 'Option 3' },
];

const Example2 = () => {
  const [selected, setSelected] = React.useState<
    { id: string; text: string } | undefined
  >(example2Options[0]);

  return (
    <View style={styles.example}>
      <Text variant="headlineMedium">Example 2</Text>

      <PaperSelect
        label="Example 2"
        options={example2Options}
        defaultValue={example2Options[0]}
        extractorFn={({ id, text }) => ({ value: id, label: text })}
        onSelection={(option) => setSelected(option)}
      />

      <Text>Selected value: {selected?.text}</Text>
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
