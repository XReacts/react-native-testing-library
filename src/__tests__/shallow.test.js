// @flow
import React from 'react';
import { View, Text } from 'react-native';
import { shallow, render } from '..';

type Props = {|
  +dummyID?: string,
|};

const TextPress = ({ dummyID }: Props) => (
  <View testID={dummyID}>
    <Text testID="text-button">Press me</Text>
  </View>
);

test('shallow rendering React elements', () => {
  //镜像root层Node节点
  const { output } = shallow(<TextPress dummyID="2" />);

  expect(output).toMatchSnapshot();
});

test('shallow rendering React Test Instance', () => {
  //镜像child层Node节点
  const { getByTestId } = render(<TextPress />);
  const { output } = shallow(getByTestId('text-button'));

  expect(output).toMatchSnapshot();
});
