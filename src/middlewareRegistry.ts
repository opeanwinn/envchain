import { MiddlewareFn, MiddlewareChain } from './middleware';

/**
 * Registry for named middleware functions.
 * Allows registering, retrieving, and building ordered chains.
 */
export class MiddlewareRegistry<T> {
  private registry = new Map<string, MiddlewareFn<T>>();
  private order: string[] = [];

  /**
   * Register a middleware under a unique name.
   * If a middleware with the same name already exists, it is replaced.
   */
  register(name: string, fn: MiddlewareFn<T>): this {
    if (!this.registry.has(name)) {
      this.order.push(name);
    }
    this.registry.set(name, fn);
    return this;
  }

  /**
   * Remove a named middleware from the registry.
   */
  unregister(name: string): this {
    this.registry.delete(name);
    this.order = this.order.filter((n) => n !== name);
    return this;
  }

  /**
   * Retrieve a middleware by name.
   */
  get(name: string): MiddlewareFn<T> | undefined {
    return this.registry.get(name);
  }

  /**
   * Build an ordered middleware chain from all registered middlewares.
   */
  buildChain(): MiddlewareChain<T> {
    return this.order
      .map((name) => this.registry.get(name))
      .filter((fn): fn is MiddlewareFn<T> => fn !== undefined);
  }

  /**
   * List all registered middleware names in order.
   */
  names(): string[] {
    return [...this.order];
  }

  /**
   * Clear all registered middlewares.
   */
  clear(): this {
    this.registry.clear();
    this.order = [];
    return this;
  }
}

/**
 * Create a new MiddlewareRegistry instance.
 */
export function createMiddlewareRegistry<T>(): MiddlewareRegistry<T> {
  return new MiddlewareRegistry<T>();
}
