// @flow
import * as React from 'react';
import prettyFormat from 'pretty-format';
import {
  ErrorWithStack,
  createLibraryNotSupportedError,
  prepareErrorMessage,
  printDeprecationWarning,
  printUnsafeWarning,
} from './errors';

const filterNodeByType = (node, type) => node.type === type;

const filterNodeByName = (node, name) =>
  typeof node.type !== 'string' &&
  (node.type.displayName === name || node.type.name === name);

const getNodeByText = (node, text) => {
  try {
    // eslint-disable-next-line
    const { Text, TextInput } = require('react-native');
    const isTextComponent = filterNodeByType(node, Text);
    if (isTextComponent) {
      const textChildren = React.Children.map(
        node.props.children,
        // In some cases child might be undefined or null
        child => (child !== undefined && child !== null ? child.toString() : '')
      );
      if (textChildren) {
        const textToTest = textChildren.join('');
        return typeof text === 'string'
          ? text === textToTest
          : text.test(textToTest);
      }
    }
    return false;
  } catch (error) {
    throw createLibraryNotSupportedError(error);
  }
};

const getTextInputNodeByPlaceholder = (node, placeholder) => {
  try {
    // eslint-disable-next-line
    const { TextInput } = require('react-native');
    return (
      filterNodeByType(node, TextInput) &&
      (typeof placeholder === 'string'
        ? placeholder === node.props.placeholder
        : placeholder.test(node.props.placeholder))
    );
  } catch (error) {
    throw createLibraryNotSupportedError(error);
  }
};

const getTextInputNodeByDisplayValue = (node, value) => {
  try {
    // eslint-disable-next-line
    const { TextInput } = require('react-native');
    return (
      filterNodeByType(node, TextInput) &&
      (typeof value === 'string'
        ? value === node.props.value
        : value.test(node.props.value))
    );
  } catch (error) {
    throw createLibraryNotSupportedError(error);
  }
};

export const getByName = (instance: ReactTestInstance, warnFn?: Function) =>
  function getByNameFn(name: string | React.ComponentType<any>) {
    warnFn && warnFn('getByName');
    try {
      return typeof name === 'string'
        ? instance.find(node => filterNodeByName(node, name))
        : instance.findByType(name);
    } catch (error) {
      throw new ErrorWithStack(prepareErrorMessage(error), getByNameFn);
    }
  };

export const getByType = (instance: ReactTestInstance, warnFn?: Function) =>
  function getByTypeFn(type: React.ComponentType<any>) {
    warnFn && warnFn('getByType');
    try {
      return instance.findByType(type);
    } catch (error) {
      throw new ErrorWithStack(prepareErrorMessage(error), getByTypeFn);
    }
  };

export const getByText = (instance: ReactTestInstance) =>
  function getByTextFn(text: string | RegExp) {
    try {
      return instance.find(node => getNodeByText(node, text));
    } catch (error) {
      throw new ErrorWithStack(prepareErrorMessage(error), getByTextFn);
    }
  };

export const getByPlaceholder = (instance: ReactTestInstance) =>
  function getByPlaceholderFn(placeholder: string | RegExp) {
    try {
      return instance.find(node =>
        getTextInputNodeByPlaceholder(node, placeholder)
      );
    } catch (error) {
      throw new ErrorWithStack(prepareErrorMessage(error), getByPlaceholderFn);
    }
  };

export const getByDisplayValue = (instance: ReactTestInstance) =>
  function getByDisplayValueFn(placeholder: string | RegExp) {
    try {
      return instance.find(node =>
        getTextInputNodeByDisplayValue(node, placeholder)
      );
    } catch (error) {
      throw new ErrorWithStack(prepareErrorMessage(error), getByDisplayValueFn);
    }
  };

export const getByProps = (instance: ReactTestInstance, warnFn?: Function) =>
  function getByPropsFn(props: { [propName: string]: any }) {
    warnFn && warnFn('getByProps');
    try {
      return instance.findByProps(props);
    } catch (error) {
      throw new ErrorWithStack(prepareErrorMessage(error), getByPropsFn);
    }
  };

export const getByTestId = (instance: ReactTestInstance) =>
  function getByTestIdFn(testID: string) {
    try {
      return instance.findByProps({ testID });
    } catch (error) {
      throw new ErrorWithStack(prepareErrorMessage(error), getByTestIdFn);
    }
  };

export const getAllByName = (instance: ReactTestInstance, warnFn?: Function) =>
  function getAllByNameFn(name: string | React.ComponentType<any>) {
    warnFn && warnFn('getAllByName');
    const results =
      typeof name === 'string'
        ? instance.findAll(node => filterNodeByName(node, name))
        : instance.findAllByType(name);
    if (results.length === 0) {
      throw new ErrorWithStack('No instances found', getAllByNameFn);
    }
    return results;
  };

export const getAllByType = (instance: ReactTestInstance, warnFn?: Function) =>
  function getAllByTypeFn(type: React.ComponentType<any>) {
    warnFn && warnFn('getAllByType');
    const results = instance.findAllByType(type);
    if (results.length === 0) {
      throw new ErrorWithStack('No instances found', getAllByTypeFn);
    }
    return results;
  };

export const getAllByText = (instance: ReactTestInstance) =>
  function getAllByTextFn(text: string | RegExp) {
    const results = instance.findAll(node => getNodeByText(node, text));
    if (results.length === 0) {
      throw new ErrorWithStack(
        `No instances found with text: ${String(text)}`,
        getAllByTextFn
      );
    }
    return results;
  };

export const getAllByPlaceholder = (instance: ReactTestInstance) =>
  function getAllByPlaceholderFn(placeholder: string | RegExp) {
    const results = instance.findAll(node =>
      getTextInputNodeByPlaceholder(node, placeholder)
    );
    if (results.length === 0) {
      throw new ErrorWithStack(
        `No instances found with placeholder: ${String(placeholder)}`,
        getAllByPlaceholderFn
      );
    }
    return results;
  };

export const getAllByDisplayValue = (instance: ReactTestInstance) =>
  function getAllByDisplayValueFn(value: string | RegExp) {
    const results = instance.findAll(node =>
      getTextInputNodeByDisplayValue(node, value)
    );
    if (results.length === 0) {
      throw new ErrorWithStack(
        `No instances found with display value: ${String(value)}`,
        getAllByDisplayValueFn
      );
    }
    return results;
  };

export const getAllByProps = (instance: ReactTestInstance, warnFn?: Function) =>
  function getAllByPropsFn(props: { [propName: string]: any }) {
    warnFn && warnFn('getAllByProps');
    const results = instance.findAllByProps(props);
    if (results.length === 0) {
      throw new ErrorWithStack(
        `No instances found with props:\n${prettyFormat(props)}`,
        getAllByPropsFn
      );
    }
    return results;
  };

export const getAllByTestId = (instance: ReactTestInstance) =>
  function getAllByTestIdFn(testID: string): ReactTestInstance[] {
    const results = instance
      .findAllByProps({ testID })
      .filter(element => typeof element.type === 'string');

    if (results.length === 0) {
      throw new ErrorWithStack(
        `No instances found with testID: ${String(testID)}`,
        getAllByTestIdFn
      );
    }
    return results;
  };

export const getByAPI = (instance: ReactTestInstance) => ({
  getByTestId: getByTestId(instance),
  getByName: getByName(instance, printDeprecationWarning),
  getByType: getByType(instance, printUnsafeWarning),
  getByText: getByText(instance),
  getByPlaceholder: getByPlaceholder(instance),
  getByDisplayValue: getByDisplayValue(instance),
  getByProps: getByProps(instance, printUnsafeWarning),
  getAllByTestId: getAllByTestId(instance),
  getAllByName: getAllByName(instance, printDeprecationWarning),
  getAllByType: getAllByType(instance, printUnsafeWarning),
  getAllByText: getAllByText(instance),
  getAllByPlaceholder: getAllByPlaceholder(instance),
  getAllByDisplayValue: getAllByDisplayValue(instance),
  getAllByProps: getAllByProps(instance, printUnsafeWarning),

  // Unsafe aliases
  UNSAFE_getByType: getByType(instance),
  UNSAFE_getAllByType: getAllByType(instance),
  UNSAFE_getByProps: getByProps(instance),
  UNSAFE_getAllByProps: getAllByProps(instance),
});
