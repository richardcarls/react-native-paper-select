import { shallowEqualObjects } from 'shallow-equal';

export const defaultLabelFn = <T extends unknown>(option: T) => {
  if (typeof option === 'string') {
    return option;
  }

  if (typeof option === 'object' && option !== null) {
    const label = objectGetProperty(option, 'label');

    if (label !== undefined) {
      return label;
    }
  }

  return String(option);
};

export const defaultValueFn = <T extends unknown>(option: T) => {
  if (typeof option === 'string') {
    return option;
  }

  if (typeof option === 'object' && option !== null) {
    const value =
      objectGetProperty(option, 'value') || objectGetProperty(option, 'id');

    if (value !== undefined) {
      return value;
    }
  }

  return String(option);
};

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

const objectGetProperty = (obj: Record<string, any>, prop: string) => {
  return Object.keys(obj).includes(prop) ? obj[prop] : undefined;
};
