// @flow
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import stripAnsi from 'strip-ansi';
import { render, fireEvent } from '..';

type ConsoleLogMock = JestMockFn<Array<string>, void>;

const PLACEHOLDER_FRESHNESS = 'Add custom freshness';
const PLACEHOLDER_CHEF = 'Who inspected freshness?';
const INPUT_FRESHNESS = 'Custom Freshie';
const INPUT_CHEF = 'I inspected freshie';

/**
 * 待测试的Button组件
 */
class Button extends React.Component<any> {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <Text>{this.props.children}</Text>
      </TouchableOpacity>
    );
  }
}

/**
 * 待测试的Banana组件
 */
class Banana extends React.Component<any, any> {
  state = {
    fresh: false,
  };

  componentDidUpdate() {
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }

  componentWillUnmount() {
    if (this.props.onUnmount) {
      this.props.onUnmount();
    }
  }

  changeFresh = () => {
    this.setState(state => ({
      fresh: !state.fresh,
    }));
  };

  render() {
    const test = 0;
    return (
      <View>
        <Text>Is the banana fresh?</Text>
        <Text testID="bananaFresh">
          {this.state.fresh ? 'fresh' : 'not fresh'}
        </Text>
        <TextInput
          testID="bananaCustomFreshness"
          placeholder={PLACEHOLDER_FRESHNESS}
          value={INPUT_FRESHNESS}
        />
        <TextInput
          testID="bananaChef"
          placeholder={PLACEHOLDER_CHEF}
          value={INPUT_CHEF}
        />
        <Button onPress={this.changeFresh} type="primary">
          Change freshness!
        </Button>
        <Text testID="duplicateText">First Text</Text>
        <Text testID="duplicateText">Second Text</Text>
        <Text>{test}</Text>
      </View>
    );
  }
}

test('getByTestId, queryByTestId', () => {
  //深度渲染后，通过getByTestId获取待测试组件
  const { getByTestId, queryByTestId } = render(<Banana />);
  const component = getByTestId('bananaFresh');

  //验证组件childeren渲染not fresh
  expect(component.props.children).toBe('not fresh');
  //验证不存在testID为InExistent的Node
  //getByTestId()没有node抛出Error
  expect(() => getByTestId('InExistent')).toThrow('No instances found');

  expect(getByTestId('bananaFresh')).toBe(component);
  //queryByTestId()没有node返回null
  expect(queryByTestId('InExistent')).toBeNull();
});

test('getAllByTestId, queryAllByTestId', () => {
  const { getAllByTestId, queryAllByTestId } = render(<Banana />);
  //getAllByTestId()返回所有匹配的node
  const textElements = getAllByTestId('duplicateText');

  //验证查找到2个元素
  expect(textElements.length).toBe(2);
  //验证第一个和第二个的文案
  expect(textElements[0].props.children).toBe('First Text');
  expect(textElements[1].props.children).toBe('Second Text');
  expect(() => getAllByTestId('nonExistentTestId')).toThrow(
    'No instances found'
  );

  const queriedTextElements = queryAllByTestId('duplicateText');

  expect(queriedTextElements.length).toBe(2);
  expect(queriedTextElements[0]).toBe(textElements[0]);
  expect(queriedTextElements[1]).toBe(textElements[1]);
  //queryAllByTestId()没有node返回空数组
  expect(queryAllByTestId('nonExistentTestId')).toHaveLength(0);
});

test('getByName, queryByName', () => {
  const { getByTestId, getByName, queryByName } = render(<Banana />);
  const bananaFresh = getByTestId('bananaFresh');
  //根据React Component类型查找Node，不建议使用，在次要RN版本不稳定，将会移除
  const button = getByName('Button');
  //"模拟"点击按钮，FIXME 事件是如何模拟的？？？
  button.props.onPress();
  //校验bananaFresh更换state之后，展示fresh文案
  expect(bananaFresh.props.children).toBe('fresh');

  //通过getByName使用Button类型，不是字符串查找
  const sameButton = getByName(Button);
  sameButton.props.onPress();

  expect(bananaFresh.props.children).toBe('not fresh');
  expect(() => getByName('InExistent')).toThrow('No instances found');
  //抛出异常验证页面Node的个数
  expect(() => getByName(Text)).toThrow('Expected 1 but found 6');

  expect(queryByName('Button')).toBe(button);
  //query没有返回null
  expect(queryByName('InExistent')).toBeNull();
});

test('getAllByName, queryAllByName', () => {
  const { getAllByName, queryAllByName } = render(<Banana />);
  const [text, status, button] = getAllByName('Text');

  expect(text.props.children).toBe('Is the banana fresh?');
  expect(status.props.children).toBe('not fresh');
  //FIXME Button也是Text？？
  expect(button.props.children).toBe('Change freshness!');
  expect(() => getAllByName('InExistent')).toThrow('No instances found');

  //[1]访问返回node数组的元素
  expect(queryAllByName('Text')[1]).toBe(status);
  expect(queryAllByName('InExistent')).toHaveLength(0);
});

test('getAllByType, queryAllByType', () => {
  const { getAllByType, queryAllByType } = render(<Banana />);
  const [text, status, button] = getAllByType(Text);
  //FIXME InExistent是方法()=>null类型？？
  const InExistent = () => null;

  expect(text.props.children).toBe('Is the banana fresh?');
  expect(status.props.children).toBe('not fresh');
  expect(button.props.children).toBe('Change freshness!');
  expect(() => getAllByType(InExistent)).toThrow('No instances found');

  expect(queryAllByType(Text)[1]).toBe(status);
  expect(queryAllByType(InExistent)).toHaveLength(0);
});

test('getByText, queryByText', () => {
  const { getByText, queryByText } = render(<Banana />);
  ///change/i是正则表达式
  const button = getByText(/change/i);

  expect(button.props.children).toBe('Change freshness!');

  const sameButton = getByText('not fresh');

  expect(sameButton.props.children).toBe('not fresh');
  expect(() => getByText('InExistent')).toThrow('No instances found');

  const zeroText = getByText('0');

  expect(queryByText(/change/i)).toBe(button);
  expect(queryByText('InExistent')).toBeNull();
  expect(() => queryByText(/fresh/)).toThrow('Expected 1 but found 3');
  expect(queryByText('0')).toBe(zeroText);
});

test('getByText, queryByText with children as Array', () => {
  //函数式组件BananaCounter
  const BananaCounter = ({ numBananas }) => (
    <Text>There are {numBananas} bananas in the bunch</Text>
  );
  //函数式组件BananaStore
  const BananaStore = () => (
    <View>
      <BananaCounter numBananas={3} />
      <BananaCounter numBananas={6} />
      <BananaCounter numBananas={5} />
    </View>
  );

  const { getByText } = render(<BananaStore />);

  const threeBananaBunch = getByText('There are 3 bananas in the bunch');
  //模板字符串需要这样匹配？
  expect(threeBananaBunch.props.children).toEqual([
    'There are ',
    3,
    ' bananas in the bunch',
  ]);
});

test('getAllByText, queryAllByText', () => {
  const { getAllByText, queryAllByText } = render(<Banana />);
  const buttons = getAllByText(/fresh/i);

  expect(buttons).toHaveLength(3);
  expect(() => getAllByText('InExistent')).toThrow('No instances found');

  expect(queryAllByText(/fresh/i)).toEqual(buttons);
  expect(queryAllByText('InExistent')).toHaveLength(0);
});

test('getByPlaceholder, queryByPlaceholder', () => {
  //通过placeHolder查找TextInput组件
  const { getByPlaceholder, queryByPlaceholder } = render(<Banana />);
  const input = getByPlaceholder(/custom/i);

  //验证placeholder属性
  expect(input.props.placeholder).toBe(PLACEHOLDER_FRESHNESS);

  const sameInput = getByPlaceholder(PLACEHOLDER_FRESHNESS);

  expect(sameInput.props.placeholder).toBe(PLACEHOLDER_FRESHNESS);
  expect(() => getByPlaceholder('no placeholder')).toThrow(
    'No instances found'
  );

  expect(queryByPlaceholder(/add/i)).toBe(input);
  expect(queryByPlaceholder('no placeholder')).toBeNull();
  expect(() => queryByPlaceholder(/fresh/)).toThrow('Expected 1 but found 2');
});

test('getAllByPlaceholder, queryAllByPlaceholder', () => {
  const { getAllByPlaceholder, queryAllByPlaceholder } = render(<Banana />);
  const inputs = getAllByPlaceholder(/fresh/i);

  expect(inputs).toHaveLength(2);
  expect(() => getAllByPlaceholder('no placeholder')).toThrow(
    'No instances found'
  );

  expect(queryAllByPlaceholder(/fresh/i)).toEqual(inputs);
  expect(queryAllByPlaceholder('no placeholder')).toHaveLength(0);
});

test('getByDisplayValue, queryByDisplayValue', () => {
  //通过displayValue查找TextInput组件
  const { getByDisplayValue, queryByDisplayValue } = render(<Banana />);
  const input = getByDisplayValue(/custom/i);

  expect(input.props.value).toBe(INPUT_FRESHNESS);

  const sameInput = getByDisplayValue(INPUT_FRESHNESS);

  expect(sameInput.props.value).toBe(INPUT_FRESHNESS);
  expect(() => getByDisplayValue('no value')).toThrow('No instances found');

  expect(queryByDisplayValue(/custom/i)).toBe(input);
  expect(queryByDisplayValue('no value')).toBeNull();
  expect(() => queryByDisplayValue(/fresh/i)).toThrow('Expected 1 but found 2');
});

test('getAllByDisplayValue, queryAllByDisplayValue', () => {
  const { getAllByDisplayValue, queryAllByDisplayValue } = render(<Banana />);
  const inputs = getAllByDisplayValue(/fresh/i);

  expect(inputs).toHaveLength(2);
  expect(() => getAllByDisplayValue('no value')).toThrow('No instances found');

  expect(queryAllByDisplayValue(/fresh/i)).toEqual(inputs);
  expect(queryAllByDisplayValue('no value')).toHaveLength(0);
});

test('getByProps, queryByProps', () => {
  //通过Node的props属性查找
  const { getByProps, queryByProps } = render(<Banana />);
  const primaryType = getByProps({ type: 'primary' });

  expect(primaryType.props.children).toBe('Change freshness!');
  expect(() => getByProps({ type: 'inexistent' })).toThrow(
    'No instances found'
  );

  expect(queryByProps({ type: 'primary' })).toBe(primaryType);
  expect(queryByProps({ type: 'inexistent' })).toBeNull();
});

test('getAllByProp, queryAllByProps', () => {
  const { getAllByProps, queryAllByProps } = render(<Banana />);
  const primaryTypes = getAllByProps({ type: 'primary' });

  expect(primaryTypes).toHaveLength(1);
  expect(() => getAllByProps({ type: 'inexistent' })).toThrow(
    'No instances found'
  );

  expect(queryAllByProps({ type: 'primary' })).toEqual(primaryTypes);
  expect(queryAllByProps({ type: 'inexistent' })).toHaveLength(0);
});

test('update', () => {
  const fn = jest.fn();
  const { getByName, update, rerender } = render(<Banana onUpdate={fn} />);
  const button = getByName('Button');

  button.props.onPress();

  //update()使用新的节点在内存中重新渲染tree
  update(<Banana onUpdate={fn} />);
  rerender(<Banana onUpdate={fn} />);

  //toHaveBeenCalledTimes，fun方法调用了3次
  //类似于Native的Mockito验证代码调用逻辑
  expect(fn).toHaveBeenCalledTimes(3);
});

test('unmount', () => {
  const fn = jest.fn();
  const { unmount } = render(<Banana onUnmount={fn} />);
  unmount();
  //toHaveBeenCalled被调用过
  expect(fn).toHaveBeenCalled();
});

test('toJSON', () => {
  const { toJSON } = render(<Button>press me</Button>);
  //渲染组件Json表达形式，镜像测试
  //是不是也替代了JEST的镜像测试，Enzyme浅层测试也被替代了
  expect(toJSON()).toMatchSnapshot();
});

test('debug', () => {
  //Jest mock方法的实现，这和Mockito不是一样吗？？
  jest.spyOn(console, 'log').mockImplementation(x => x);

  //debug
  const { debug } = render(<Banana />);
  //深度渲染组件输出log
  debug();
  debug('my custom message');
  //浅层渲染组件输出log
  debug.shallow();
  debug.shallow('my other custom message');

  //FIXME 这个地方是在验证组件深处渲染后log的输出吗？jest.spyOn()方法Mock是为了拿到输出日志？？
  // eslint-disable-next-line no-console
  const mockCalls = ((console.log: any): ConsoleLogMock).mock.calls;

  expect(stripAnsi(mockCalls[0][0])).toMatchSnapshot();
  expect(stripAnsi(mockCalls[1][0] + mockCalls[1][1])).toMatchSnapshot(
    'with message'
  );
  expect(stripAnsi(mockCalls[2][0])).toMatchSnapshot('shallow');
  expect(stripAnsi(mockCalls[3][0] + mockCalls[3][1])).toMatchSnapshot(
    'shallow with message'
  );
});

test('debug changing component', () => {
  //Mock console对象的log方法实现，
  jest.spyOn(console, 'log').mockImplementation(x => x);

  //渲染Banana组件后，点击type为primary的按钮，实际改变this.state.fresh
  const { getByProps, debug } = render(<Banana />);
  fireEvent.press(getByProps({ type: 'primary' }));
  //打印深度渲染的组件
  debug();

  //FIXME 这个地方是在验证组件深处渲染后log的输出吗？jest.spyOn()方法Mock是为了拿到输出日志？？
  // eslint-disable-next-line no-console
  const mockCalls = ((console.log: any): ConsoleLogMock).mock.calls;

  expect(stripAnsi(mockCalls[4][0])).toMatchSnapshot(
    'bananaFresh button message should now be "fresh"'
  );
});

test('renders options.wrapper around node', () => {
  const WrapperComponent = ({ children }) => (
    <SafeAreaView testID="wrapper">{children}</SafeAreaView>
  );

  const { toJSON, getByTestId } = render(<View testID="inner" />, {
    wrapper: WrapperComponent,
  });

  expect(getByTestId('wrapper')).toBeTruthy();
  expect(toJSON()).toMatchInlineSnapshot(`
    <RCTSafeAreaView
      emulateUnlessSupported={true}
      testID="wrapper"
    >
      <View
        testID="inner"
      />
    </RCTSafeAreaView>
  `);
});

test('renders options.wrapper around updated node', () => {
  //一个React Component将渲染的组件作为childern包裹
  const WrapperComponent = ({ children }) => (
    <SafeAreaView testID="wrapper">{children}</SafeAreaView>
  );

  //使用wrapper包括渲染的component <View>
  const { toJSON, getByTestId, rerender } = render(<View testID="inner" />, {
    wrapper: WrapperComponent,
  });
  //rerender模拟React更新root，增加accessibilityLabel属性
  rerender(<View testID="inner" accessibilityLabel="test" />);

  expect(getByTestId('wrapper')).toBeTruthy();
  //镜像校验，更新后accessibilityLabel属性是否在正确Node位置
  expect(toJSON()).toMatchInlineSnapshot(`
    <RCTSafeAreaView
      emulateUnlessSupported={true}
      testID="wrapper"
    >
      <View
        accessibilityLabel="test"
        testID="inner"
      />
    </RCTSafeAreaView>
  `);
});
