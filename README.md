<div align='center'>
  <img
    height="80"
    width="80"
    alt="owl"
    src="https://raw.githubusercontent.com/callstack/react-native-testing-library/master/website/static/img/owl.png"
  />
  <h1>React Native Testing Library</h1>

  <p>轻量级React Native测试工具，帮助你以更少的精力编写更好的测试。.</P>
</div>

[![Version][version-badge]][package]
[![PRs Welcome][prs-welcome-badge]][prs-welcome]
[![Chat][chat-badge]][chat]
[![Sponsored by Callstack][callstack-badge]][callstack]

_致谢通知：该项目的灵感来源于[react-testing-library](https://github.com/kentcdodds/react-testing-library)。去Check it Out并使用它测试你的Web React 应用。_

## 问题

你想为你的React Native组件编写可维护的测试，而无需测试实现细节，但是却被告知使用Enzyme，你所学的没有React Native适配器，这意味着仅仅支持浅层测试。而你想深度渲染！但是深度渲染可能需要jsdom(React Native不是web!)，而用`react-test-renderer`进行深层测试是如何痛苦。

你还想使用最新的React功能，但是您需要等待测试库的抽象赶上类，这需要一段时间。

你最终只想使用最佳实践来进行测试，然而Enzyme可能会实现细节进行断言。

## 解决方案

`react-native-testing-library`是用于测试你的React Native组件的轻量级解决方案。它在`react-test-renderer`基础之上提供轻量级的实用程序功能，使你可以始终了解最新的React功能，并编写所需的任何组件测试。但是实际上没有，它阻止你实现细节，因为我们认为这是非常糟糕的做法。

该库替代了[Enzyme](http://airbnb.io/enzyme/). 他可以和Jest一起用于测试，但是也应与其它测试runner一起使用。

## Example

```jsx
import { render, fireEvent } from 'react-native-testing-library';
import { QuestionsBoard } from '../QuestionsBoard';
import { Question } from '../Question';

function setAnswer(question, answer) {
  fireEvent.changeText(question, answer);
}

test('should verify two questions', () => {
  const { getAllByA11yRole, getByText } = render(<QuestionsBoard {...props} />);
  const allQuestions = getAllByA11yRole('header');

  setAnswer(allQuestions[0], 'a1');
  setAnswer(allQuestions[1], 'a2');

  fireEvent.press(getByText('submit'));

  expect(props.verifyQuestions).toBeCalledWith({
    '1': { q: 'q1', a: 'a1' },
    '2': { q: 'q2', a: 'a2' },
  });
});
```

## 安装

在你项目的目录打开Terminal和运行：

```sh
yarn add --dev react-native-testing-library
```

这个库有一个peerDependencies列举了`react-test-renderer`等，当然还有`react`。确保也安装他们！

[Flow]用户注意事项(https://flow.org)  – 你也将需要为`react-test-renderer`安装类型：

```sh
flow-typed install react-test-renderer
```

你可能已注意到，它根本不与React Native绑定 – 如果您不想直接与DOM交互，可以在自己的React组件中安全地使用它。

## API / 用法

`react-native-testing-library`的[public API]https://callstack.github.io/react-native-testing-library/docs/api)重点介绍一下基本方法：

- [`render`](https://callstack.github.io/react-native-testing-library/docs/api#render) – 深度渲染给定的React元素，并返回帮助器以查询输出组件。
- [`fireEvent`](https://callstack.github.io/react-native-testing-library/docs/api#fireevent) - 调用元素上命名事件处理程序。
- [`waitForElement`](https://callstack.github.io/react-native-testing-library/docs/api#waitforelement) - 等待不确定的时间，知道你的元素出现或显示出现或超时。
- [`flushMicrotasksQueue`](https://callstack.github.io/react-native-testing-library/docs/api#flushmicrotasksqueue) - 等待micro任务队列刷新。

**更熟悉`react-testing-library`的用户注意:** 该API不会公开cleanup，因为它不与DOM交互。没有什么需要清理的。

## Made with ❤️ at Callstack

React Native Testing Library is an open source project and will always remain free to use. If you think it's cool, please star it 🌟. [Callstack](https://callstack.com) is a group of React and React Native geeks, contact us at [hello@callstack.com](mailto:hello@callstack.com) if you need any help with these or just want to say hi!

---

Supported and used by [Rally Health](https://www.rallyhealth.com/careers-home).

<!-- badges -->

[version-badge]: https://img.shields.io/npm/v/react-native-testing-library.svg?style=flat-square
[package]: https://www.npmjs.com/package/react-native-testing-library
[prs-welcome-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs-welcome]: http://makeapullrequest.com
[chat-badge]: https://img.shields.io/discord/426714625279524876.svg?style=flat-square&colorB=758ED3
[chat]: https://discord.gg/QbGezWe
[callstack-badge]: https://callstack.com/images/callstack-badge.svg
[callstack]: https://callstack.com/open-source/?utm_source=github.com&utm_medium=referral&utm_campaign=react-native-testing-library&utm_term=readme
