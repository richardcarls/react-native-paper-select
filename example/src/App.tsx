import * as React from 'react';

import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  useTheme,
  Text,
  SegmentedButtons,
  Chip,
  Button,
  Switch,
} from 'react-native-paper';

import {
  PaperSelect,
  type PaperSelectMultiState,
} from '@rcarls/react-native-paper-select';

export const App = () => {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screencontent}
      >
        <SimpleExample />
        <ControlledExample />
        <MultiExample />
        <CollectionExample />
        <CustomRenderExample />
      </ScrollView>
    </PaperProvider>
  );
};

export default App;

const simpleOptions = ['one', 'two', 'three'];

const alotOfOptions = [
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
  'Twenty',
  'Twenty-one',
  'Twenty-two',
  'Twenty-three',
  'Twenty-four',
  'Twenty-five',
  'Twenty-six',
  'Twenty-seven',
  'Twenty-eight',
  'Twenty-nine',
  'Thirty',
];

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
        style={styles.inputGroup}
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
        style={styles.inputGroup}
      />

      <PaperSelect
        label="Example"
        options={simpleOptions}
        value={selected}
        noneOption={false}
        onSelection={(option) => option && setSelected(option)}
        style={styles.inputGroup}
      />

      <Text>Selected value: {selected}</Text>
    </View>
  );
};

const MultiExample = () => {
  const [selected, setSelected] = React.useState<string[] | undefined>();
  const [checkboxes, setCheckboxes] = React.useState(false);
  const [modal, setModal] = React.useState<'modal' | 'dropdown'>('dropdown');

  return (
    <View style={styles.example}>
      <Text variant="headlineMedium">Multi-select Example</Text>

      <PaperSelect
        multi={checkboxes ? 'checkboxes' : true}
        renderMenu={modal}
        label="Example"
        options={simpleOptions}
        defaultValue={selected}
        onSelection={setSelected}
        style={styles.inputGroup}
      />

      <View style={styles.rowGroup}>
        <View style={styles.inputGroup}>
          <Text variant="labelSmall">Checkboxes</Text>
          <Switch
            value={checkboxes}
            onValueChange={() => setCheckboxes(!checkboxes)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text variant="labelSmall">Modal</Text>
          <Switch
            value={modal === 'modal'}
            onValueChange={(value) => setModal(value ? 'modal' : 'dropdown')}
          />
        </View>
      </View>

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
        style={styles.inputGroup}
      />

      <Text>Selected value: {selected?.text}</Text>
    </View>
  );
};

const CustomRenderExample = () => {
  const [selected, setSelected] = React.useState<string[] | undefined>(
    alotOfOptions.slice(0, 8)
  );

  const paperTheme = useTheme();

  const customStyles = StyleSheet.create({
    inputContainer: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      minHeight: 56,
      backgroundColor: paperTheme.colors.surfaceVariant,
      borderTopStartRadius: paperTheme.roundness,
      borderTopEndRadius: paperTheme.roundness,
      borderBottomColor: paperTheme.colors.outline,
      borderBottomWidth: 1,
    },
    label: {
      paddingTop: 2,
      fontSize: 12,
      fontWeight: '400',
      letterSpacing: 0.15,
      transform: [{ scale: 0.98 }],
      color: paperTheme.colors.onSurfaceVariant,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      marginVertical: 4,
      marginHorizontal: 4,
      backgroundColor: 'transparent',
    },
    buttonContainer: {
      marginVertical: 8,
      flexDirection: 'row-reverse',
    },
  });

  const renderChips = (state: PaperSelectMultiState<string>) => {
    const { openMenu, clearSelected, deselect } = state;

    return (
      <>
        <View style={customStyles.inputContainer}>
          <Text variant="bodyLarge" style={customStyles.label}>
            Example
          </Text>

          <View style={customStyles.chipContainer}>
            {selected?.map((option) => (
              <Chip
                key={option}
                mode="outlined"
                onClose={() => deselect(option)}
                style={customStyles.chip}
              >
                {option}
              </Chip>
            ))}
          </View>
        </View>

        <View style={customStyles.buttonContainer}>
          <Button mode="contained-tonal" onPress={openMenu}>
            Add
          </Button>

          <Button onPress={clearSelected}>Clear</Button>
        </View>
      </>
    );
  };

  return (
    <View style={styles.example}>
      <Text variant="headlineMedium">Custom Render Example</Text>

      <PaperSelect
        multi
        label="Example"
        options={alotOfOptions}
        defaultValue={selected}
        onSelection={(values) => setSelected(values)}
        renderFn={renderChips}
        style={styles.inputGroup}
      />

      <Text>Selected value: {selected?.join(', ')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  screencontent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  example: {
    flex: 1,
    alignItems: 'stretch',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginEnd: 8,
    marginBottom: 8,
  },
  rowGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
