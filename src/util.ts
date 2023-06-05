import { shallowEqualObjects } from 'shallow-equal';

export const optionCompare = <T extends unknown>(
  opt1: T | undefined,
  opt2: T | undefined
) => {
  if (typeof opt1 === 'object' && typeof opt2 === 'object') {
    return shallowEqualObjects(opt1, opt2);
  } else {
    /* eslint-disable-next-line eqeqeq */
    return opt1 == opt2;
  }
};

export const objectGetProperty = (obj: Record<string, any>, prop: string) => {
  return Object.keys(obj).includes(prop) ? obj[prop] : undefined;
};

export const defaultValueFn = <T extends unknown>(option: T) => {
  if (option === undefined) {
    return undefined;
  }

  if (typeof option === 'string') {
    return option;
  }

  let value;
  if (typeof option === 'object' && option !== null) {
    value =
      objectGetProperty(option, 'value') ||
      objectGetProperty(option, 'id') ||
      objectGetProperty(option, 'key');
  }

  return value ?? String(option);
};

export const defaultLabelFn = <T extends unknown>(option: T) => {
  if (option === undefined) {
    return undefined;
  }

  if (typeof option === 'string') {
    return option;
  }

  let label;
  if (typeof option === 'object' && option !== null) {
    label = objectGetProperty(option, 'label');
  }

  return label ?? defaultValueFn(option);
};
