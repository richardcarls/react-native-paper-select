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
        <MultiExample />
        <CollectionExample />
      </View>
    </PaperProvider>
  );
};

export default App;

const simpleOptions = ['one', 'two', 'three'];

const collectionOptions = [
  { id: 'e637939a-cf3e-45c4-a57c-0b2cf4f03d92', text: 'Option 1' },
  { id: 'c4d81412-e97e-481e-8f15-7fabc28ff154', text: 'Option 2' },
  { id: 'd848ec93-a112-4897-a092-01145b17702e', text: 'Option 3' },
];

const SimpleExample = () => {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);

  return (
    <View style={styles.example}>
      <Text variant="headlineMedium">Simple Example</Text>

      <PaperSelect
        label="Example"
        options={simpleOptions}
        onSelection={(value) => setSelected(value)}
        style={styles.formGroup}
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
        style={styles.formGroup}
      />

      <PaperSelect
        label="Example"
        options={simpleOptions}
        value={selected}
        noneOption={false}
        onSelection={(option) => option && setSelected(option)}
        style={styles.formGroup}
      />

      <Text>Selected value: {selected}</Text>
    </View>
  );
};

const MultiExample = () => {
  const [selected, setSelected] = React.useState<string[] | undefined>(
    undefined
  );

  return (
    <View style={styles.example}>
      <Text variant="headlineMedium">Multi-select Example</Text>

      <PaperSelect
        multi
        label="Example"
        options={simpleOptions}
        onSelection={(values) => setSelected(values)}
        style={styles.formGroup}
      />

      <Text>Selected value: {selected?.join(', ')}</Text>
    </View>
  );
};

const CollectionExample = () => {
  const [selected, setSelected] = React.useState<
    { id: string; text: string } | undefined
  >(collectionOptions[0]);

  return (
    <View style={styles.example}>
      <Text variant="headlineMedium">Collection Example</Text>

      <PaperSelect
        label="Example"
        options={collectionOptions}
        defaultValue={collectionOptions[0]}
        valueFn={({ id }) => id}
        labelFn={({ text }) => text}
        onSelection={(option) => setSelected(option)}
        style={styles.formGroup}
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
  formGroup: {
    marginVertical: 16,
  },
});
