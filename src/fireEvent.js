// @flow
import act from './act';
import { ErrorWithStack } from './helpers/errors';

const findEventHandler = (
  element: ReactTestInstance,
  eventName: string,
  callsite?: any
) => {
  //通过eventName拼接eventHander名称on"E"vent名称
  const eventHandler = toEventHandlerName(eventName);

  //验证元素的props是否有该eventNamen和eventHander
  if (typeof element.props[eventHandler] === 'function') {
    return element.props[eventHandler];
  } else if (typeof element.props[eventName] === 'function') {
    return element.props[eventName];
  }

  //如果没有父元素了，那抛出异常
  if (element.parent === null || element.parent.parent === null) {
    throw new ErrorWithStack(
      `No handler function found for event: "${eventName}"`,
      callsite || invokeEvent
    );
  }

  //递归向上寻找props的eventName和eventHander
  return findEventHandler(element.parent, eventName, callsite);
};

const invokeEvent = (
  element: ReactTestInstance,
  eventName: string,
  callsite?: any,
  ...data: Array<any>
) => {
  //从根元素到父元素遍历查找eventName和eventHander查找方法Hander
  const handler = findEventHandler(element, eventName, callsite);

  if (!handler) {
    return null;
  }

  //使用传入的数据调用该方法，实际还是使用react测试提供的act方法执行方法
  let returnValue;
  //act将渲染、用户事件或数据获取等任务视为与用户交互的'单元'。
  //React提供名为act()的helper，确保在进行任何断言之前，与这些'单元'相关的所有更新都已经处理并应用于DOM
  //参考：https://zh-hans.reactjs.org/docs/testing-recipes.html
  act(() => {
    returnValue = handler(...data);
  });

  //返回调用后的返回值
  return returnValue;
};

//拼接onEventName事件名称
const toEventHandlerName = (eventName: string) =>
  `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;

const pressHandler = (element: ReactTestInstance) =>
  invokeEvent(element, 'press', pressHandler);
const changeTextHandler = (element: ReactTestInstance, ...data: Array<any>) =>
  invokeEvent(element, 'changeText', changeTextHandler, ...data);
const scrollHandler = (element: ReactTestInstance, ...data: Array<any>) =>
  invokeEvent(element, 'scroll', scrollHandler, ...data);

//自定义名称事件
const fireEvent = (
  element: ReactTestInstance,
  eventName: string,
  ...data: Array<any>
) => invokeEvent(element, eventName, fireEvent, ...data);

//确定名称的事件
fireEvent.press = pressHandler;
fireEvent.changeText = changeTextHandler;
fireEvent.scroll = scrollHandler;

export default fireEvent;
