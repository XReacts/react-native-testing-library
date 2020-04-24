// @flow
import * as React from 'react';
import TestRenderer, { type ReactTestRenderer } from 'react-test-renderer'; // eslint-disable-line import/no-extraneous-dependencies
import act from './act';
import { addToCleanupQueue } from './cleanup';
import { getByAPI } from './helpers/getByAPI';
import { queryByAPI } from './helpers/queryByAPI';
import a11yAPI from './helpers/a11yAPI';
import debugShallow from './helpers/debugShallow';
import debugDeep from './helpers/debugDeep';

type Options = {
  wrapper?: React.ComponentType<any>,
  createNodeMock?: (element: React.Element<any>) => any,
};
type TestRendererOptions = {
  createNodeMock: (element: React.Element<any>) => any,
};

/**
 * 使用react-test-render深度渲染测试组件，并提供断言输出的帮助API
 */
export default function render<T>(
  component: React.Element<T>,
  { wrapper: Wrapper, createNodeMock }: Options = {}
) {
  const wrap = (innerElement: React.Element<any>) =>
    Wrapper ? <Wrapper>{innerElement}</Wrapper> : innerElement;

  const renderer = renderWithAct(
    wrap(component),
    createNodeMock ? { createNodeMock } : undefined
  );
  const update = updateWithAct(renderer, wrap);
  const instance = renderer.root;

  addToCleanupQueue(renderer.unmount);

  //在React Render基础上，封装"上层"对象返回
  return {
    ...getByAPI(instance),
    ...queryByAPI(instance),
    ...a11yAPI(instance),
    update,
    rerender: update, // alias for `update`
    unmount: renderer.unmount,
    toJSON: renderer.toJSON,
    debug: debug(instance, renderer),
  };
}

function renderWithAct(
  component: React.Element<any>,
  options?: TestRendererOptions
): ReactTestRenderer {
  let renderer: ReactTestRenderer;

  act(() => {
    //使用React-Rest-Render创建render对象，实际底层还是React Render
    renderer = TestRenderer.create(component, options);
  });

  return ((renderer: any): ReactTestRenderer);
}

function updateWithAct(
  renderer: ReactTestRenderer,
  wrap: (innerElement: React.Element<any>) => React.Element<any>
) {
  return function(component: React.Element<any>) {
    act(() => {
      renderer.update(wrap(component));
    });
  };
}

function debug(instance: ReactTestInstance, renderer) {
  function debugImpl(message?: string) {
    return debugDeep(renderer.toJSON(), message);
  }
  debugImpl.shallow = message => debugShallow(instance, message);
  return debugImpl;
}
