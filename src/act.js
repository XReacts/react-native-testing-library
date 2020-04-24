// @flow
import { act } from 'react-test-renderer';

const actMock = (callback: () => void) => {
  callback();
};

//act实际上还是调用了react-test-render的act方法
export default act || actMock;
