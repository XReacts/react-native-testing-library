// @flow
import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import act from '../act';
import render from '../render';
import fireEvent from '../fireEvent';

//Effect Hook，React 16.8出的新特性，可以在不使用class的情况下使用State以及他的React特性
//参考：https://zh-hans.reactjs.org/docs/hooks-effect.html
const UseEffect = ({ callback }: { callback: Function }) => {
  //Hook useEffect,类似于componentDidMoun和componentDidUpdate
  React.useEffect(callback);
  return null;
};

const Counter = () => {
  //Hook useState,在不编写class的情况下使用state
  const [count, setCount] = React.useState(0);

  return (
    <Text testID="counter" onPress={() => setCount(count + 1)}>
      {count}
    </Text>
  );
};

test('render should trigger useEffect', () => {
  const effectCallback = jest.fn();
  //render：render方法会触发useEffect
  render(<UseEffect callback={effectCallback} />);

  expect(effectCallback).toHaveBeenCalledTimes(1);
});

test('update should trigger useEffect', () => {
  const effectCallback = jest.fn();
  const { update } = render(<UseEffect callback={effectCallback} />);
  //update：在内存中使用新的root元素重新渲染
  update(<UseEffect callback={effectCallback} />);

  expect(effectCallback).toHaveBeenCalledTimes(2);
});

test('fireEvent should trigger useState', () => {
  const { getByTestId } = render(<Counter />);
  const counter = getByTestId('counter');
  //counter.props.children验证值
  expect(counter.props.children).toEqual(0);
  //触发press事件
  fireEvent.press(counter);
  expect(counter.props.children).toEqual(1);
});

test('should act even if there is no act in react-test-renderer', () => {
  // $FlowFixMe
  ReactTestRenderer.act = undefined;
  const callback = jest.fn();
  //执行callback()方法，其实fireEvent底层实现就是act
  //参考：https://zh-hans.reactjs.org/docs/test-utils.html#act
  act(() => {
    callback();
  });

  expect(callback).toHaveBeenCalled();
});
