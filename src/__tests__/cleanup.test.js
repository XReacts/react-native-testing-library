// @flow
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { View } from 'react-native';
import { cleanup, render } from '..';

class Test extends React.Component<*> {
  componentWillUnmount() {
    if (this.props.onUnmount) {
      this.props.onUnmount();
    }
  }
  render() {
    return <View />;
  }
}

test('cleanup', () => {
  const fn = jest.fn();

  render(<Test onUnmount={fn} />);
  render(<Test onUnmount={fn} />);
  //渲染完毕，当然没有调用Unmount
  expect(fn).not.toHaveBeenCalled();
  //clean()Unmount使用render渲染的React tree
  cleanup();
  //验证调用2次onUnmount
  expect(fn).toHaveBeenCalledTimes(2);
});
