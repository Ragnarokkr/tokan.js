# Tokan.js

**Tokan** ("特観", "とくかん") is a Japanese compound word where "特" (_toku_)
means "special" and "観" (_kan_) relates to "view" or "observation." This term
aptly reflects the purpose of the Tokan library, which serves as a specialized
tool for observing changes in the Document Object Model (DOM) of web
applications.

Tokan is a library designed to simplify and enhance the functionality of the
native `MutationObserver` API. The native API, while powerful, can be complex
and cumbersome to use, especially for developers who need to track various types
of changes in the DOM. Tokan addresses these challenges by providing a more
user-friendly interface that abstracts away some of the complexities associated
with the native API.

Key Features:

- **Simplified Syntax**: The library offers a more intuitive syntax for setting
  up observers, reducing boilerplate code and making it easier to implement.
- **Batch Processing**: It can batch multiple mutations together, allowing for
  more efficient handling of changes and reducing the number of callback
  executions.
- **Custom Callbacks**: Users can define custom callback functions that can be
  triggered based on specific types of mutations, providing greater control over
  how changes are handled.

---

## Types

### TokanMutationFilterCallback

- **Type**: `(node: Node) => boolean`
- **Description**: A callback function that determines whether a node should be
  considered for mutation observation. It receives a `Node` as input and returns
  a boolean indicating whether the node should be included.
- **Usage Example**:
  ```typescript
  const filterCallback: TokanMutationFilterCallback = (node) =>
    node.nodeName === "DIV";
  ```

### TokanMutationFilter

- **Type**: `string | TokanMutationFilterCallback`
- **Description**: A filter that can be either a string or a
  `TokanMutationFilterCallback`. If a string is provided, it might represent an
  attribute name. If a callback is provided, it uses the
  `TokanMutationFilterCallback` returned result.
- **Usage Example**:
  ```typescript
  const filter: TokanMutationFilter = "div.my-class";
  const filterCallback: TokanMutationFilterCallback = (node) =>
    node.textContent.includes("var");
  ```

### TokanMutationKindOptions

- **Type**: `interface`
- **Properties**:
  - `oldValue` (optional): `boolean` - Indicates whether the previous value of
    the node should be recorded.
  - `subtree` (optional): `boolean` - Indicates whether the observer should
    monitor the entire subtree of the target node.
  - `filters` (optional): `TokanMutationFilter[]` - An array of filters to apply
    to nodes being observed.
- **Usage Example**:
  ```typescript
  const options: TokanMutationKindOptions = {
    oldValue: true,
    subtree: true,
    filters: ["id", "class", (node) => node.nodeName === "PICTURE"],
  };
  ```

### TokanEventCallback

- **Type**: `(nodeList: Node, data?: unknown) => void`
- **Description**: A callback function that is triggered when a mutation event
  occurs. It receives the affected node list and optional data related to the
  mutation.
- **Usage Example**:
  ```typescript
  const eventCallback: TokanEventCallback = (nodeList, data) => {
    console.log("Mutation detected:", nodeList, data);
  };
  ```

### TokanObserverDescriptor

- **Type**: `interface`
- **Properties**:
  - `id`: `number` - A unique identifier for the observer instance.
  - `instance`: `MutationObserver` - The actual MutationObserver instance.
  - `config`: `MutationObserverInit` - Configuration options for the
    MutationObserver.
  - `filters`: `Set<TokanMutationFilterCallback>` - A set of filter callbacks
    applied to nodes.
  - `started`: `boolean` - Indicates whether the observer has been started.
- **Usage Example**:
  ```typescript
  const observerDescriptor: TokanObserverDescriptor = {
    id: 1,
    instance: new MutationObserver(eventCallback),
    config: { attributes: true },
    filters: new Set([filterCallback]),
    started: false,
  };
  ```

## Constants

### TokanMutationKinds

- **Type**: `object`
- **Description**: An object containing constants representing different types
  of mutations that can be observed.
- **Constants**:
  - `Attr`: `"attributes"` - Represents changes to the attributes of elements.
  - `CharData`: `"characterData"` - Represents changes to the text content of
    nodes.
  - `Nodes`: `"nodes"` - Represents additions or removals of child nodes.
- **Usage Example**:
  ```typescript
  const mutationKind = TokanMutationKinds.Attr;
  console.log(mutationKind); // Output: "attributes"
  ```

### TokanMutationEvents

- **Type**: `object`
- **Description**: An object containing constants representing different
  mutation events that can be triggered.
- **Constants**:
  - `Added`: `"added"` - Triggered when nodes are added.
  - `AttrChanged`: `"attributeChanged"` - Triggered when attributes of elements
    change.
  - `CharDataChanged`: `"characterDataChanged"` - Triggered when the text
    content of nodes changes.
  - `Removed`: `"removed"` - Triggered when nodes are removed.
- **Usage Example**:
  ```typescript
  const mutationEvent = TokanMutationEvents.CharDataChanged;
  console.log(mutationEvent); // Output: "characterDataChanged"
  ```

## Class: Tokan

### Static Properties

#### Tokan.MutationKinds

<table>
  <tr>
    <th>Constant</th>
    <th>Type</th>
    <th>Value</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Attr</td>
    <td>string</td>
    <td>"attributes"</td>
    <td>Represents changes to the attributes of elements.</td>
  </tr>
  <tr>
    <td>CharData</td>
    <td>string</td>
    <td>"characterData"</td>
    <td>Represents changes to the text content of nodes.</td>
  </tr>
  <tr>
    <td>Nodes</td>
    <td>string</td>
    <td>"nodes"</td>
    <td>Represents additions or removals of child nodes.</td>
  </tr>
</table>

#### Tokan.MutationEvents

<table>
  <tr>
    <th>Constant</th>
    <th>Type</th>
    <th>Value</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Added</td>
    <td>string</td>
    <td>"added"</td>
    <td>Triggered when nodes are added.</td>
  </tr>
  <tr>
    <td>AttrChanged</td>
    <td>string</td>
    <td>"attributeChanged"</td>
    <td>Triggered when attributes of elements change.</td>
  </tr>
  <tr>
    <td>CharDataChanged</td>
    <td>string</td>
    <td>"characterDataChanged"</td>
    <td>Triggered when the text content of nodes changes.</td>
  </tr>
  <tr>
    <td>Removed</td>
    <td>string</td>
    <td>"removed"</td>
    <td>Triggered when nodes are removed.</td>
  </tr>
</table>

### Constructor

<table>
  <tr>
    <th>Method</th>
    <th>Parameters</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>constructor</td>
    <td>target: string | Node</td>
    <td>Initializes a new instance of the Tokan class with a target node or a CSS selector string.</td>
  </tr>
</table>

### Methods

<table>
  <tr>
    <th>Method</th>
    <th>Parameters</th>
    <th>Returns</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>observerRouter</td>
    <td>mutationList: MutationRecord[], observer: MutationObserver</td>
    <td>void</td>
    <td>Routes mutation records to the appropriate listeners based on the mutation type and filters.</td>
  </tr>
  <tr>
    <td>watch</td>
    <td>mutationKind: TokanMutationKind, options?: TokanMutationKindOptions</td>
    <td>number | undefined</td>
    <td>Sets up a new observer for a specific type of mutation.</td>
  </tr>
  <tr>
    <td>unwatch</td>
    <td>id?: number</td>
    <td>boolean</td>
    <td>Stops and removes an observer or all observers.</td>
  </tr>
  <tr>
    <td>on</td>
    <td>event: TokanMutationEvent, callback: TokanEventCallback</td>
    <td>Tokan</td>
    <td>Adds an event listener for a specific mutation event.</td>
  </tr>
  <tr>
    <td>start</td>
    <td>id?: number</td>
    <td>void</td>
    <td>Starts observing with a specific observer or all observers.</td>
  </tr>
  <tr>
    <td>stop</td>
    <td>id?: number</td>
    <td>void</td>
    <td>Stops observing with a specific observer or all observers.</td>
  </tr>
</table>

### Constructor

#### `constructor(target: string | Node)`

- **Description**: Initializes a new instance of the `Tokan` class with a target
  node or a CSS selector string.
- **Parameters**:
  - `target`: `string | Node` - The target node or a CSS selector string to
    observe.
- **Usage Example**:
  ```typescript
  const tokan = new Tokan("#myElement");
  const tokanNode = new Tokan(document.getElementById("myElement"));
  ```

### Private Properties

#### `target: Node`

- **Description**: The target node being observed.

#### `observerId: number`

- **Description**: A unique identifier for observer instances.

#### `observers: Set<TokanObserverDescriptor>`

- **Description**: A set of observer descriptors.

#### `listeners: { [key in TokanMutationEvent]: TokanEventCallback[] }`

- **Description**: An object mapping mutation events to their respective event
  callbacks.

### Methods

#### `observerRouter(mutationList: MutationRecord[], observer: MutationObserver): void`

- **Description**: Routes mutation records to the appropriate listeners based on
  the mutation type and filters.
- **Parameters**:
  - `mutationList`: `MutationRecord[]` - A list of mutation records.
  - `observer`: `MutationObserver` - The observer instance that generated the
    mutation records.
- **Usage Example**: (Internal method, not directly called by users)

#### `watch(mutationKind: TokanMutationKind, options?: TokanMutationKindOptions): number | undefined`

- **Description**: Sets up a new observer for a specific type of mutation.
- **Parameters**:
  - `mutationKind`: `TokanMutationKind` - The type of mutation to observe.
  - `options` (optional): `TokanMutationKindOptions` - Configuration options for
    the observer.
- **Returns**: `number | undefined` - The ID of the new observer or `undefined`
  if an error occurs.
- **Usage Example**:
  ```typescript
  const observerId = tokan.watch(Tokan.MutationKinds.Attr, {
    oldValue: true,
    subtree: true,
    filters: ['input[type="text"]', filterCallback],
  });
  ```

#### `unwatch(id?: number): boolean`

- **Description**: Stops and removes an observer or all observers.
- **Parameters**:
  - `id` (optional): `number` - The ID of the observer to remove. If not
    provided, all observers are removed.
- **Returns**: `boolean` - Indicates whether the operation was successful.
- **Usage Example**:
  ```typescript
  tokan.unwatch(observerId);
  tokan.unwatch(); // Removes all observers
  ```

#### `on(event: TokanMutationEvent, callback: TokanEventCallback): Tokan`

- **Description**: Adds an event listener for a specific mutation event.
- **Parameters**:
  - `event`: `TokanMutationEvent` - The type of mutation event to listen for.
  - `callback`: `TokanEventCallback` - The callback function to execute when the
    event occurs.
- **Returns**: `Tokan` - The current `Tokan` instance for method chaining.
- **Usage Example**:
  ```typescript
  tokan.on(Tokan.MutationEvents.Added, (node) => {
    console.log("Node added:", node);
  });
  ```

#### `start(id?: number): void`

- **Description**: Starts observing with a specific observer or all observers.
- **Parameters**:
  - `id` (optional): `number` - The ID of the observer to start. If not
    provided, all observers are started.
- **Usage Example**:
  ```typescript
  tokan.start(observerId);
  tokan.start(); // Starts all observers
  ```

#### `stop(id?: number): void`

- **Description**: Stops observing with a specific observer or all observers.
- **Parameters**:
  - `id` (optional): `number` - The ID of the observer to stop. If not provided,
    all observers are stopped.
- **Usage Example**:
  ```typescript
  tokan.stop(observerId);
  tokan.stop(); // Stops all observers
  ```

## Example Usage

### Setting Up an Observer

```typescript
const tokan = new Tokan("#myElement");

const filterCallback: TokanMutationFilterCallback = (node) =>
  node.nodeName === "A";

const observerAttrsId = tokan.watch(Tokan.MutationKinds.Attr, {
  oldValue: true,
  subtree: true,
  filters: ["id", "class", "disabled"],
});

const observerNodesID = tokan.watch(Tokan.MutationKinds.Nodes, {
  subtree: true,
  filters: [filterCallback],
});

tokan.on(Tokan.MutationEvents.Added, (node) => {
  console.log("Node added:", node);
});

tokan.on(Tokan.MutationEvents.AttrChanged, (node, data) => {
  console.log("Attribute changed:", node, data);
});

tokan.start();
```

### Stopping an Observer

```typescript
tokan.stop();
tokan.unwatch();
```

### Listening for Multiple Events

```typescript
tokan.on(Tokan.MutationEvents.Removed, (node) => {
  console.log("Node removed:", node);
});

tokan.on(Tokan.MutationEvents.CharDataChanged, (node, data) => {
  console.log("Character data changed:", node, data);
});

tokan.start();
```
