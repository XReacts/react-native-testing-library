// @flow
/* eslint-disable no-console */
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import stripAnsi from 'strip-ansi';
import { debug, render, fireEvent, flushMicrotasksQueue } from '..';
import debugShallow from '../helpers/debugShallow';

type ConsoleLogMock = JestMockFn<Array<string>, void>;

function TextComponent({ text }) {
  return <Text>{text}</Text>;
}

class Button extends React.Component<any, any> {
  state = { counter: 0 };

  onPress = async () => {
    await Promise.resolve();

    this.setState({ counter: 1 });
    this.props.onPress();
  };

  render() {
    return (
      <TouchableOpacity onPress={this.onPress}>
        <TextComponent text={`${this.props.text} ${this.state.counter}`} />
      </TouchableOpacity>
    );
  }
}

test('debug', () => {
  //mock console.log方法
  jest.spyOn(console, 'log').mockImplementation(x => x);

  //渲染并日志输出组件
  const component = <Button onPress={jest.fn} text="Press me" />;
  debug(component);

  //通过mock的console.log获取到输出日志
  const output = ((console.log: any): ConsoleLogMock).mock.calls[0][0];

  expect(stripAnsi(output)).not.toEqual(output);
  //镜像测试
  expect(stripAnsi(output)).toMatchSnapshot();

  //Reset Mock的所有信息
  ((console.log: any): ConsoleLogMock).mockReset();
  //传入message重新渲染
  debug(component, 'test message');

  expect(console.log).toHaveBeenCalledWith('test message\n\n', output);
});

test('debug.shallow', () => {
  //浅层测试
  expect(debug.shallow).toBe(debugShallow);
});

test('debug.deep', () => {
  // $FlowFixMe
  console.log = jest.fn();
  const component = <Button onPress={jest.fn} text="Press me" />;
  //深层渲染输出日志
  debug.deep(component);

  const output = ((console.log: any): ConsoleLogMock).mock.calls[0][0];

  expect(stripAnsi(output)).not.toEqual(output);
  expect(stripAnsi(output)).toMatchSnapshot();

  ((console.log: any): ConsoleLogMock).mockReset();

  debug.deep(component, 'test message');

  expect(console.log).toHaveBeenCalledWith('test message\n\n', output);
});

test('debug.deep async test', async () => {
  // $FlowFixMe
  console.log = jest.fn();
  const { toJSON, getByName } = render(
    <Button onPress={jest.fn} text="Press me" />
  );

  fireEvent.press(getByName('TouchableOpacity'));
  await flushMicrotasksQueue();

  debug.deep(toJSON());

  const output = ((console.log: any): ConsoleLogMock).mock.calls[0][0];

  expect(stripAnsi(output)).toMatchSnapshot();
});
