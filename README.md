<p align="center">
  <img src="https://user-images.githubusercontent.com/2182637/53611918-54c1ff80-3c24-11e9-9917-66ac3cef513d.png" alt="react beautiful dnd logo" />
</p>
<h1 align="center">react-pretty-dnd <small><sup>(rpd)</sup></small></h1>
<h4 align="center">fork of react-beautiful-dnd <small><sup>(rbd)</sup></small></h4>

<div align="center">

**Beautiful** and **accessible** drag and drop for lists with [`React`](https://facebook.github.io/react/)

[![CircleCI branch](https://img.shields.io/circleci/project/github/atlassian/react-beautiful-dnd/master.svg)](https://circleci.com/gh/atlassian/react-beautiful-dnd/tree/master)
[![npm](https://img.shields.io/npm/v/react-beautiful-dnd.svg)](https://www.npmjs.com/package/react-beautiful-dnd)

![quote application example](https://user-images.githubusercontent.com/2182637/53614150-efbed780-3c2c-11e9-9204-a5d2e746faca.gif)

[Play with this example if you want!](https://react-beautiful-dnd.netlify.com/iframe.html?selectedKind=board&selectedStory=simple)

</div>

## Core characteristics

- Beautiful and [natural movement](/docs/about/animations.md) of items 💐
- [Accessible](/docs/about/accessibility.md): powerful keyboard and screen reader support ♿️
- [Extremely performant](/docs/support/media.md) 🚀
- Clean and powerful api which is simple to get started with
- Plays extremely well with standard browser interactions
- [Unopinionated styling](/docs/guides/preset-styles.md)
- No creation of additional wrapper dom nodes - flexbox and focus management friendly!

## Get started 👩‍🏫

We have created [a free course on `egghead.io` 🥚](https://egghead.io/courses/beautiful-and-accessible-drag-and-drop-with-react-beautiful-dnd) to help you get started with `react-beautiful-dnd` as quickly as possible.

[![course-logo](https://user-images.githubusercontent.com/2182637/43372837-8c72d3f8-93e8-11e8-9d92-a82adde7718f.png)](https://egghead.io/courses/beautiful-and-accessible-drag-and-drop-with-react-beautiful-dnd)

## Currently supported feature set ✅

- Vertical lists ↕
- Horizontal lists ↔
- Movement between lists (▤ ↔ ▤)
- [Virtual list support 👾](/docs/patterns/virtual-lists.md) - unlocking 10,000 items @ 60fps
- [Combining items](/docs/guides/combining.md)
- Mouse 🐭, keyboard 🎹♿️ and touch 👉📱 (mobile, tablet and so on) support
- [Multi drag support](/docs/patterns/multi-drag.md)
- Incredible screen reader support ♿️ - we provide an amazing experience for english screen readers out of the box 📦. We also provide complete customisation control and internationalisation support for those who need it 💖
- [Conditional dragging](/docs/api/draggable.md#optional-props) and [conditional dropping](/docs/api/droppable.md#conditionally-dropping)
- Multiple independent lists on the one page
- Flexible item sizes - the draggable items can have different heights (vertical lists) or widths (horizontal lists)
- [Add and remove items during a drag](/docs/guides/changes-while-dragging.md)
- Compatible with semantic `<table>` reordering - [table pattern](/docs/patterns/tables.md)
- [Auto scrolling](/docs/guides/auto-scrolling.md) - automatically scroll containers and the window as required during a drag (even with keyboard 🔥)
- Custom drag handles - you can drag a whole item by just a part of it
- Able to move the dragging item to another element while dragging (clone, portal) - [Reparenting your `<Draggable />`](/docs/guides/reparenting.md)
- [Create scripted drag and drop experiences 🎮](/docs/sensors/sensor-api.md)
- Allows extensions to support for [any input type you like 🕹](/docs/sensors/sensor-api.md)
- 🌲 Tree support through the [`@atlaskit/tree`](https://atlaskit.atlassian.com/packages/confluence/tree) package
- A `<Droppable />` list can be a scroll container (without a scrollable parent) or be the child of a scroll container (that also does not have a scrollable parent)
- Independent nested lists - a list can be a child of another list, but you cannot drag items from the parent list into a child list
- Server side rendering (SSR) compatible - see [resetServerContext()](/docs/api/reset-server-context.md)
- Plays well with [nested interactive elements](/docs/api/draggable.md#interactive-child-elements-within-a-draggable-) by default
- **Shadow DOM / encapsulated window** support via the [`environment` prop](#shadow-dom--environment) on `<DragDropContext />`
- React **18** and **19** peer support

## Shadow DOM & `environment`

When drag-and-drop lives in a normal light DOM tree, you do not need anything special:

```jsx
import { DragDropContext, Droppable, Draggable } from 'react-pretty-dnd';

<DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="list">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {/* <Draggable /> items */}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

By default the library uses the global `window` and `document` for:

- pointer / keyboard / touch event listeners
- window scroll and viewport size
- `getComputedStyle` for dimensions
- `document.querySelectorAll` to find drag handles
- injecting style tags and screen-reader nodes into `document.head` / `document.body`

That breaks (or calculates wrong positions) when your list is mounted **inside a Shadow DOM** or behind a **proxy / encapsulated window** (some micro-frontend and web-component hosts). Use the `environment` prop on `<DragDropContext />` to tell the library which window and which query root to use.

### `environment` prop

```js
type EnvironmentInput = {|
  // Required: host window used for scroll, events, getComputedStyle
  window: typeof window,
  // Optional: where querySelectorAll looks for drag handles / draggables
  // Defaults to environment.window.document
  root?: Document | ShadowRoot | Element,
|};
```

| Field | Used for |
| --- | --- |
| `window` | `addEventListener`, `pageXOffset` / `pageYOffset`, `scrollBy`, `getComputedStyle`, viewport width/height |
| `root` | `querySelectorAll` for drag handles and draggable nodes (must see into your Shadow DOM) |
| `window.document` (derived) | Creating / appending style tags, announcer nodes, default clone portal container |

Pass `environment` **only** on `<DragDropContext />`. You do **not** pass it on each `<Droppable />` or `<Draggable />`.

### Open Shadow DOM example

Mount React into an open shadow root and pass that root as `environment.root`:

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-pretty-dnd';

function List({ shadowRoot }) {
  const [items, setItems] = useState([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' },
  ]);

  function onDragEnd(result) {
    if (!result.destination) {
      return;
    }
    const next = Array.from(items);
    const [removed] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, removed);
    setItems(next);
  }

  return (
    <DragDropContext
      environment={{
        window, // browsing-context window (or a host-provided proxy window)
        root: shadowRoot, // so querySelectorAll can see shadow nodes
      }}
      onDragEnd={onDragEnd}
    >
      <Droppable droppableId="shadow-list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    {item.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function ShadowHost() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const shadowRoot = host.shadowRoot || host.attachShadow({ mode: 'open' });
    let mountPoint = shadowRoot.querySelector('[data-rpd-mount]');
    if (!mountPoint) {
      mountPoint = document.createElement('div');
      mountPoint.setAttribute('data-rpd-mount', 'true');
      shadowRoot.appendChild(mountPoint);
    }

    const root = createRoot(mountPoint);
    root.render(<List shadowRoot={shadowRoot} />);

    return () => root.unmount();
  }, []);

  return <div ref={hostRef} />;
}
```

### Encapsulated / proxy `window`

Some hosts expose a non-global `window` (custom scroll offsets, isolated event targets). Pass that object as `environment.window`:

```jsx
<DragDropContext
  environment={{
    window: hostWindow, // must expose pageXOffset/pageYOffset, addEventListener,
    // getComputedStyle, scrollBy, and document
    root: shadowRoot, // optional; defaults to hostWindow.document
  }}
  onDragEnd={onDragEnd}
>
  {/* ... */}
</DragDropContext>
```

Minimum surface the library expects on `environment.window`:

- `pageXOffset` / `pageYOffset`
- `scrollBy(x, y)`
- `getComputedStyle(element)`
- `addEventListener` / `removeEventListener`
- `document` (with `documentElement`, `body`, `head`, `createElement`, `querySelector`)

### Closed Shadow DOM

`document.querySelectorAll` cannot see into a **closed** shadow root from outside. You must pass the `ShadowRoot` reference your component already holds:

```jsx
environment={{ window, root: closedShadowRoot }}
```

If you only have the host element and not the closed root, discovery will fail.

### Scroll containers across shadow boundaries

Scroll parents are discovered by walking `parentElement`, then crossing into the light DOM via `shadowRoot.host` when needed. A scrollable ancestor **outside** the shadow tree is still found correctly. Prefer real `overflow: auto | scroll` containers rather than product-specific selectors.

### Clones / portals inside Shadow DOM

By default, dragging clones portal to `document.body` (light DOM). Inside Shadow DOM you usually want the clone to stay in the same tree:

```jsx
<Droppable
  droppableId="list"
  renderClone={(provided, snapshot, rubric) => (/* ... */)}
  getContainerForClone={() => shadowRoot} // or a node inside the shadow root
>
  {/* ... */}
</Droppable>
```

### Legacy `dndContext` prop

`dndContext` is **deprecated** but still accepted for compatibility:

- Window-like value → treated as `{ window: dndContext, root: dndContext.document }`
- Query-root-like value (ShadowRoot / Document / Element) → treated as `{ window: globalThis.window, root: dndContext }` (scroll/events still use the global window — prefer `environment` for full support)

If both `environment` and `dndContext` are passed, `environment` wins.

### More detail

Full prop reference: [`<DragDropContext />` API](/docs/api/drag-drop-context.md).  
Storybook example: `stories/60-environment.stories.js` (“shadow DOM environment”).

## Motivation 🤔

`react-beautiful-dnd` exists to create beautiful drag and drop for lists that anyone can use - even people who cannot see. For a good overview of the history and motivations of the project you can take a look at these external resources:

- 📖 [Rethinking drag and drop](https://medium.com/@alexandereardon/rethinking-drag-and-drop-d9f5770b4e6b)
- 🎧 [React podcast: fast, accessible and beautiful drag and drop](https://reactpodcast.simplecast.fm/17)

## Not for everyone ✌️

There are a lot of libraries out there that allow for drag and drop interactions within React. Most notable of these is the amazing [`react-dnd`](https://github.com/react-dnd/react-dnd). It does an incredible job at providing a great set of drag and drop primitives which work especially well with the [wildly inconsistent](https://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html) html5 drag and drop feature. `react-beautiful-dnd` is a higher level abstraction specifically built for lists (vertical, horizontal, movement between lists, nested lists and so on). Within that subset of functionality `react-beautiful-dnd` offers a powerful, natural and beautiful drag and drop experience. However, it does not provide the breadth of functionality offered by `react-dnd`. So `react-beautiful-dnd` might not be for you depending on what your use case is.

## Documentation 📖

### About 👋

- [Installation](/docs/about/installation.md)
- [Examples and samples](/docs/about/examples.md)
- [Get started](https://egghead.io/courses/beautiful-and-accessible-drag-and-drop-with-react-beautiful-dnd)
- [Design principles](/docs/about/design-principles.md)
- [Animations](/docs/about/animations.md)
- [Accessibility](/docs/about/accessibility.md)
- [Browser support](/docs/about/browser-support.md)

### Sensors 🔉

> The ways in which somebody can start and control a drag

- [Mouse dragging 🐭](/docs/sensors/mouse.md)
- [Touch dragging 👉📱](/docs/sensors/touch.md)
- [Keyboard dragging 🎹♿️](/docs/sensors/keyboard.md)
- [Create your own sensor](/docs/sensors/sensor-api.md) (allows for any input type as well as scripted experiences)

### API 🏋️‍

![diagram](https://user-images.githubusercontent.com/2182637/53607406-c8f3a780-3c12-11e9-979c-7f3b5bd1bfbd.gif)

- [`<DragDropContext />`](/docs/api/drag-drop-context.md) - _Wraps the part of your application you want to have drag and drop enabled for_ (includes [`environment` / Shadow DOM](#shadow-dom--environment))
- [`<Droppable />`](/docs/api/droppable.md) - _An area that can be dropped into. Contains `<Draggable />`s_
- [`<Draggable />`](/docs/api/draggable.md) - _What can be dragged around_
- [`resetServerContext()`](/docs/api/reset-server-context.md) - _Utility for server side rendering (SSR)_
- [Shadow DOM & `environment`](#shadow-dom--environment) - _Using drag and drop inside Shadow DOM or with a proxy window_

### Guides 🗺

- [`<DragDropContext />` responders](/docs/guides/responders.md) - _`onDragStart`, `onDragUpdate`, `onDragEnd` and `onBeforeDragStart`_
- [Combining `<Draggable />`s](/docs/guides/combining.md)
- [Common setup issues](/docs/guides/common-setup-issues.md)
- [Using `innerRef`](/docs/guides/using-inner-ref.md)
- [Setup problem detection and error recovery](/docs/guides/setup-problem-detection-and-error-recovery.md)
- [Rules for `draggableId` and `droppableId`s](/docs/guides/identifiers.md)
- [Browser focus retention](/docs/guides/browser-focus.md)
- [Customising or skipping the drop animation](/docs/guides/drop-animation.md)
- [Auto scrolling](/docs/guides/auto-scrolling.md)
- [Controlling the screen reader](/docs/guides/screen-reader.md)
- [Use the html5 `doctype`](/docs/guides/doctype.md)
- [`TypeScript` and `flow`: type information](/docs/guides/types.md)
- [Dragging `<svg>`s](/docs/guides/dragging-svgs.md)
- [Avoiding image flickering](/docs/guides/avoiding-image-flickering.md)
- [Non-visible preset styles](/docs/guides/preset-styles.md)
- [How we detect scroll containers](/docs/guides/how-we-detect-scroll-containers.md)
- [How we use dom events](/docs/guides/how-we-use-dom-events.md) - _Useful if you need to build on top of `react-beautiful-dnd`_
- [Adding `<Draggable />`s during a drag (11.x behaviour)](/docs/guides/changes-while-dragging.md) - _⚠️ Advanced_
- [Setting up Content Security Policy](/docs/guides/content-security-policy.md)

### Patterns 👷‍

- [Virtual lists 👾](/docs/patterns/virtual-lists.md)
- [Multi drag](/docs/patterns/multi-drag.md)
- [Tables](/docs/patterns/tables.md)
- [Reparenting a `<Draggable />`](/docs/guides/reparenting.md) - _Using our cloning API or your own portal_

### Support 👩‍⚕️

- [Engineering health](/docs/support/engineering-health.md)
- [Community and addons](/docs/support/community-and-addons.md)
- [Release notes and changelog](https://github.com/atlassian/react-beautiful-dnd/releases)
- [Upgrading](/docs/support/upgrading.md)
- [Road map](https://github.com/atlassian/react-beautiful-dnd/issues)
- [Media](/docs/support/media.md)

## Read this in other languages 🌎

- [![kr](https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/24/South-Korea.png) **한글/Korean**](https://github.com/LeeHyungGeun/react-beautiful-dnd-kr)
- [![ru](https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/24/Russia.png) **На русском/Russian**](https://github.com/vtereshyn/react-beautiful-dnd-ru)
- [![pt](https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/24/Brazil.png) **Português/Portuguese**](https://github.com/dudestein/react-beautiful-dnd-pt)
- [![gr](https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/shiny/24/Greece.png) **Ελληνικά/Greek**](https://github.com/hdks55l/react-beautiful-dnd-gr)

## Author ✍️

Alex Reardon [@alexandereardon](https://twitter.com/alexandereardon)

## Collaborators 🤝

- Bogdan Chadkin [@IAmTrySound](https://twitter.com/IAmTrySound)
- Luke Batchelor [@alukebatchelor](https://twitter.com/alukebatchelor)
- Jared Crowe [@jaredjcrowe](https://twitter.com/jaredjcrowe)
- Many other [@Atlassian](https://twitter.com/Atlassian)'s!
