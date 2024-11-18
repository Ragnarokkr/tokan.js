/**
 * **Tokan** ("特観", "とくかん") is a Japanese compound word where "特" (_toku_)
 * means "special" and "観" (_kan_) relates to "view" or "observation." This term
 * aptly reflects the purpose of the Tokan library, which serves as a specialized
 * tool for observing changes in the Document Object Model (DOM) of web
 * applications.
 *
 * Tokan is a library designed to simplify and enhance the functionality of the
 * native `MutationObserver` API. The native API, while powerful, can be complex
 * and cumbersome to use, especially for developers who need to track various types
 * of changes in the DOM. Tokan addresses these challenges by providing a more
 * user-friendly interface that abstracts away some of the complexities associated
 * with the native API.
 *
 * Key Features:
 *
 * - **Simplified Syntax**: The library offers a more intuitive syntax for setting
 *   up observers, reducing boilerplate code and making it easier to implement.
 * - **Batch Processing**: It can batch multiple mutations together, allowing for
 *   more efficient handling of changes and reducing the number of callback
 *   executions.
 * - **Custom Callbacks**: Users can define custom callback functions that can be
 *   triggered based on specific types of mutations, providing greater control over
 *   how changes are handled.
 *
 * @version 0.1.0
 */

/**
 * Type for the callback function used in filtering nodes. It takes
 * a Node as parameter and returns a boolean according to the required
 * conditions.
 */
type TokanMutationFilterCallback = (node: Node) => boolean;
/**
 * A type that represents a filter for mutations, which can be either
 * a string or a callback function.
 */
type TokanMutationFilter = string | TokanMutationFilterCallback;

/**
 * Options for configuring a mutation observer.
 */
type TokanMutationKindOptions = {
  /**
   * Indicates whether to include the old value of the attribute in the
   * mutation record.
   */
  oldValue?: boolean;
  /**
   * Indicates whether to observe the entire subtree of the target node.
   */
  subtree?: boolean;
  /**
   * An array of filters to apply to the mutations. String filters are
   * applied only to attribute mutations, while callback filters are applied
   * to all mutations.
   */
  filters?: TokanMutationFilter[];
};

/**
 * A callback function type that is invoked when a mutation event occurs.
 *
 * @param nodeList - The node that was mutated.
 * @param data - Optional additional data related to the mutation.
 */
type TokanEventCallback = (
  nodeList: Node,
  data?: unknown,
) => void;

/**
 * Descriptor for a mutation observer, containing its configuration and state.
 */
type TokanObserverDescriptor = {
  /**
   * Unique identifier for the observer.
   */
  id: number;
  /**
   * The MutationObserver instance.
   */
  instance: MutationObserver;
  /**
   * The configuration options for the observer.
   */
  config: MutationObserverInit;
  /**
   * A set of filters applied to the observer.
   */
  filters: Set<TokanMutationFilterCallback>;
  /**
   * Indicates whether the observer is currently active.
   */
  started: boolean;
};

/**
 * Enumeration of mutation kinds that can be observed.
 */
const TokanMutationKinds = {
  /**
   * Observes attribute changes.
   */
  Attr: "attributes",
  /**
   * Observes character data changes.
   */
  CharData: "characterData",
  /**
   * Observes changes to child nodes.
   */
  Nodes: "nodes",
} as const;

/**
 * A type representing the possible mutation kinds.
 */
type TokanMutationKind =
  typeof TokanMutationKinds[keyof typeof TokanMutationKinds];

/**
 * Enumeration of mutation events that can be emitted.
 */
const TokanMutationEvents = {
  /**
   * Event emitted when nodes are added.
   */
  Added: "added",
  /**
   * Event emitted when an attribute is changed.
   */
  AttrChanged: "attributeChanged",
  /**
   * Event emitted when character data is changed.
   */
  CharDataChanged: "characterDataChanged",
  /**
   * Event emitted when nodes are removed.
   */
  Removed: "removed",
} as const;

/**
 * A type representing the possible mutation events.
 */
type TokanMutationEvent =
  typeof TokanMutationEvents[keyof typeof TokanMutationEvents];

/**
 * A class that provides a way to observe DOM mutations.
 *
 * Tokan is a class that provides a convenient API for observing DOM mutations.
 * It's designed to be simple to use and to provide a better experience than
 * MutationObserver.
 *
 * @example
 * const tokan = new Tokan("#container");
 * tokan.watch("nodes", { subtree: true, filters: [(node) => node.nodeName === "P"] });
 * tokan.on("added", (node) => console.log("Node added:", node));
 * tokan.start();
 */
class Tokan {
  /**
   * Available mutation kinds.
   */
  static MutationKinds = TokanMutationKinds;
  /**
   * Available mutation events.
   */
  static MutationEvents = TokanMutationEvents;

  private target: Node;
  private observerId: number;
  private observers: Set<TokanObserverDescriptor>;
  private listeners: {
    [key in TokanMutationEvent]: TokanEventCallback[];
  };

  /**
   * Creates an instance of the Tokan class.
   *
   * @param target - A string selector or a Node to observe.
   * @throws Will throw an error if the target is neither a string nor a Node.
   */
  constructor(target: string | Node) {
    if (typeof target === "string") {
      this.target = document.querySelector(target) ?? document;
    } else if (target instanceof Node) this.target = target;
    else {
      throw new Error("Expected selector or Node as target.");
    }

    this.observerId = 0;
    this.observers = new Set<TokanObserverDescriptor>();
    this.listeners = {
      added: [],
      attributeChanged: [],
      characterDataChanged: [],
      removed: [],
    };
  }

  /**
   * Routes mutation records to the appropriate listeners.
   *
   * @param mutationList - The list of mutation records.
   * @param observer - The MutationObserver instance that triggered the callback.
   */
  private observerRouter(
    mutationList: MutationRecord[],
    observer: MutationObserver,
  ) {
    let filters;

    for (const observerDescriptor of this.observers) {
      if (observerDescriptor.instance === observer) {
        filters = observerDescriptor.filters;
      }
    }

    for (const mutation of mutationList) {
      if (mutation.type === "attributes") {
        for (const listener of this.listeners.attributeChanged) {
          if (filters?.size) {
            filters.forEach((filter) => {
              if (filter(mutation.target)) {
                listener(mutation.target, {
                  name: mutation.attributeName,
                  oldValue: mutation.oldValue,
                });
              }
            });
          } else {
            listener(mutation.target, {
              name: mutation.attributeName,
              oldValue: mutation.oldValue,
            });
          }
        }
      } else if (mutation.type === "characterData") {
        for (const listener of this.listeners.characterDataChanged) {
          if (filters?.size) {
            filters.forEach((filter) => {
              if (filter(mutation.target)) {
                listener(mutation.target, {
                  oldValue: mutation.oldValue,
                });
              }
            });
          } else {
            listener(mutation.target, {
              oldValue: mutation.oldValue,
            });
          }
        }
      } else if (mutation.type === "childList") {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (filters?.size) {
              filters.forEach((filter) => {
                if (filter(node)) {
                  for (const listener of this.listeners.added) {
                    listener(node);
                  }
                }
              });
            } else {
              for (const listener of this.listeners.added) {
                listener(node);
              }
            }
          }
        }

        if (mutation.removedNodes.length > 0) {
          for (const node of mutation.removedNodes) {
            if (filters?.size) {
              filters.forEach((filter) => {
                if (filter(node)) {
                  for (const listener of this.listeners.removed) {
                    listener(node);
                  }
                }
              });
            } else {
              for (const listener of this.listeners.removed) {
                listener(node);
              }
            }
          }
        }
      }
    }
    observer.takeRecords();
  }

  /**
   * Sets up a new observer for the specified kind of mutation.
   *
   * @param mutationKind The kind of mutation to observe.
   * @param options (Optional) Options for the observer.
   * @returns The unique identifier for the observer.
   * @throws Will throw an error if the specified mutation kind is not supported.
   */
  watch(
    mutationKind: TokanMutationKind,
    options?: TokanMutationKindOptions,
  ): number | undefined {
    this.observerId++;

    const descriptor: TokanObserverDescriptor = {
      id: this.observerId,
      instance: new MutationObserver(this.observerRouter.bind(this)),
      config: {},
      filters: new Set(
        options?.filters?.filter((f) => typeof f !== "string"),
      ),
      started: false,
    };

    if (mutationKind === TokanMutationKinds.Attr) {
      descriptor.config = {
        attributes: true,
        attributeOldValue: options?.oldValue,
        attributeFilter: options?.filters?.filter((f) => typeof f === "string"),
        subtree: options?.subtree,
      };
      this.observers.add(descriptor);
      return this.observerId;
    }

    if (mutationKind === TokanMutationKinds.CharData) {
      descriptor.config = {
        characterData: true,
        characterDataOldValue: options?.oldValue,
        subtree: options?.subtree,
      };
      this.observers.add(descriptor);
      return this.observerId;
    }

    if (mutationKind === TokanMutationKinds.Nodes) {
      descriptor.config = {
        childList: true,
        subtree: options?.subtree,
      };
      this.observers.add(descriptor);
      return this.observerId;
    }

    this.observerId--;
    throw new Error(
      `Expected a TokanMutationKind value but got "${mutationKind}"`,
    );
  }

  /**
   * Removes an observer from the list of observers.
   * If no id is provided, it removes all observers that have not been started.
   *
   * @param id The id of the observer to remove.
   * @returns True if the observer was found and removed, false otherwise.
   */
  unwatch(id?: number) {
    if (id) {
      for (const observer of this.observers) {
        if (observer.id === id && !observer.started) {
          observer.instance.disconnect();
          this.observers.delete(observer);
          return true;
        } else return false;
      }
    } else {
      for (const observer of this.observers) {
        if (!observer.started) {
          observer.instance.disconnect();
        } else return false;
      }
      this.observers.clear();
      return true;
    }
    return false;
  }

  /**
   * Registers a callback function to be called when a mutation of the specified
   * event type occurs.
   * @param event The type of mutation event to listen for.
   * @param callback The function to be called when the mutation event occurs.
   * @returns The `Tokan` instance for chaining.
   * @throws Will throw an error if the specified event type is not supported.
   */
  on(event: TokanMutationEvent, callback: TokanEventCallback) {
    if (event === Tokan.MutationEvents.Added) {
      this.listeners.added.push(callback);
    } else if (event === Tokan.MutationEvents.AttrChanged) {
      this.listeners.attributeChanged.push(callback);
    } else if (event === Tokan.MutationEvents.CharDataChanged) {
      this.listeners.characterDataChanged.push(callback);
    } else if (event === Tokan.MutationEvents.Removed) {
      this.listeners.removed.push(callback);
    } else {
      throw new Error(`Expected a TokanMutationEvent but got ${event}.`);
    }
    return this;
  }

  /**
   * Starts observing mutations for the observer with the specified ID, or for
   * all observers if no ID is provided.
   * @param id The ID of the observer to start. If not provided, all observers
   * are started.
   */
  start(id?: number) {
    if (id) {
      for (const observer of this.observers) {
        if (observer.id === id && !observer.started) {
          observer.instance.observe(this.target, observer.config);
          observer.started = true;
        } else break;
      }
    } else {
      for (const observer of this.observers) {
        if (!observer.started) {
          observer.instance.observe(this.target, observer.config);
          observer.started = true;
        }
      }
    }
  }

  /**
   * Stops observing mutations for the observer with the specified ID, or for
   * all observers if no ID is provided.
   * @param id The ID of the observer to stop. If not provided, all observers
   * are stopped.
   */
  stop(id?: number) {
    if (id) {
      for (const observer of this.observers) {
        if (observer.id === id && observer.started) {
          observer.instance.disconnect();
          observer.started = false;
        } else break;
      }
    } else {
      for (const observer of this.observers) {
        if (observer.started) {
          observer.instance.disconnect();
          observer.started = false;
        }
      }
    }
  }
}

export {
  Tokan,
  type TokanEventCallback,
  type TokanMutationEvent,
  type TokanMutationFilter,
  type TokanMutationFilterCallback,
  type TokanMutationKind,
  type TokanMutationKindOptions,
};
