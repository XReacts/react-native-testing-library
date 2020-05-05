// @flow
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
} from 'react-native';
import { render, fireEvent } from '..';

//待测试支持点击组件
const OnPressComponent = ({ onPress }) => (
  <View>
    <TouchableOpacity onPress={onPress} testID="button">
      <Text testID="text-button">Press me</Text>
    </TouchableOpacity>
  </View>
);

//待测试不支持点击组件
const WithoutEventComponent = () => (
  <View>
    <Text testID="text">Content</Text>
  </View>
);

//待测试自定义事件组件
const CustomEventComponent = ({ onCustomEvent }) => (
  <TouchableOpacity onPress={onCustomEvent}>
    <Text>Click me</Text>
  </TouchableOpacity>
);

const MyCustomButton = ({ handlePress }) => (
  <OnPressComponent onPress={handlePress} />
);

const CustomEventComponentWithCustomName = ({ handlePress }) => (
  <MyCustomButton testID="my-custom-button" handlePress={handlePress} />
);

describe('fireEvent', () => {
  test('should invoke specified event', () => {
    //jest生成一个Mock方法，该Mock方法可以追踪调用
    const onPressMock = jest.fn();
    //使用Mock的onPress方法，渲染支持点击的组件
    const { getByTestId } = render(<OnPressComponent onPress={onPressMock} />);

    //fireEvent触发id为button按钮的press事件
    //参考：fireEvent，https://callstack.github.io/react-native-testing-library/docs/api
    fireEvent(getByTestId('button'), 'press');

    //验证传入组件的onPress方法，是否被调用了
    expect(onPressMock).toHaveBeenCalled();
  });

  test('should invoke specified event on parent element', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<OnPressComponent onPress={onPressMock} />);

    //调用的是text-button Text，调用父控件的press方法
    fireEvent(getByTestId('text-button'), 'press');
    expect(onPressMock).toHaveBeenCalled();
  });

  test('should throw an Error when event handler was not found', () => {
    const { getByTestId } = render(<WithoutEventComponent />);

    //触发press，没有事件抛出异常
    expect(() => fireEvent(getByTestId('text'), 'press')).toThrow(
      'No handler function found for event: "press"'
    );
  });

  test('should invoke event with custom name', () => {
    const handlerMock = jest.fn();
    const EVENT_DATA = 'event data';

    const { getByTestId } = render(
      <View>
        <CustomEventComponent testID="custom" onCustomEvent={handlerMock} />
      </View>
    );

    //FIXME 这个方法定义了参数么？？？
    fireEvent(getByTestId('custom'), 'customEvent', EVENT_DATA);

    expect(handlerMock).toHaveBeenCalledWith(EVENT_DATA);
  });

  test('should not bubble event to root element', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <TouchableOpacity onPress={onPressMock}>
        <Text testID="test">Content</Text>
      </TouchableOpacity>
    );

    //内层Text没有点击事件
    expect(() => fireEvent.press(getByTestId('test'))).toThrow();
    //Mock方法没有被调用
    expect(onPressMock).not.toHaveBeenCalled();
  });
});

test('fireEvent.press', () => {
  const onPressMock = jest.fn();
  const { getByTestId } = render(<OnPressComponent onPress={onPressMock} />);

  //fireEvent.press：调用实践处理在改元素或者父元素
  //参考：fireEvent.press，https://callstack.github.io/react-native-testing-library/docs/api
  fireEvent.press(getByTestId('text-button'));

  //所以父元素事件触发，Mock方法被调用了
  expect(onPressMock).toHaveBeenCalled();
});

test('fireEvent.scroll', () => {
  //Mock滑动事件，和滑动参数
  const onScrollMock = jest.fn();
  const eventData = {
    nativeEvent: {
      contentOffset: {
        y: 200,
      },
    },
  };

  //渲染滑动组件
  const { getByTestId } = render(
    <ScrollView testID="scroll-view" onScroll={onScrollMock}>
      <Text>XD</Text>
    </ScrollView>
  );

  //使用参数调用ScrollView的滑动事件
  fireEvent.scroll(getByTestId('scroll-view'), eventData);

  //验证滑动事件是否调用
  expect(onScrollMock).toHaveBeenCalledWith(eventData);
});

test('fireEvent.changeText', () => {
  const onChangeTextMock = jest.fn();
  const CHANGE_TEXT = 'content';

  const { getByTestId } = render(
    <View>
      <TextInput testID="text-input" onChangeText={onChangeTextMock} />
    </View>
  );

  fireEvent.changeText(getByTestId('text-input'), CHANGE_TEXT);

  expect(onChangeTextMock).toHaveBeenCalledWith(CHANGE_TEXT);
});

test('custom component with custom event name', () => {
  const handlePress = jest.fn();

  const { getByTestId } = render(
    <CustomEventComponentWithCustomName handlePress={handlePress} />
  );

  //触发自定义名称事件handlePress
  fireEvent(getByTestId('my-custom-button'), 'handlePress');

  expect(handlePress).toHaveBeenCalled();
});

test('event with multiple handler parameters', () => {
  const handlePress = jest.fn();

  const { getByTestId } = render(
    <CustomEventComponentWithCustomName handlePress={handlePress} />
  );

  //触发自定义事件handlePress多次
  fireEvent(getByTestId('my-custom-button'), 'handlePress', 'param1', 'param2');

  expect(handlePress).toHaveBeenCalledWith('param1', 'param2');
});
