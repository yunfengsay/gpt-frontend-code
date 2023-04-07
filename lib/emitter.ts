type EventHandler<T> = (data?: T) => void;

class Emitter<T> {
  private handlers: Map<string, EventHandler<T>[]>;

  constructor() {
    this.handlers = new Map<string, EventHandler<T>[]>();
  }

  public on(eventName: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)?.push(handler);
  }

  public off(eventName: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventName);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index >= 0) {
      handlers.splice(index, 1);
    }
  }

  public emit(eventName: string, data?: T): void {
    const handlers = this.handlers.get(eventName);
    if (!handlers) return;
    handlers.forEach((handler) => {
      handler(data);
    });
  }
}

export const eventEmmiter = new Emitter()