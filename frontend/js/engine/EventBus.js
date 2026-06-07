/**
 * EventBus.js
 * Simple publish-subscribe event bus for decoupling game subsystems.
 * Usage:
 *   EventBus.on('enemy:killed', handler);
 
 
 
 
 *   EventBus.emit('enemy:killed', { gold: 10 });
 */
 
 
 
 /* 
 
 4.1.3 & 4.2.1  bus event update resource
 
 
 
 
 
 
 
 
 
 
 
 
 */
class EventBus {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this._listeners = new Map();
    }

    /**
     * Subscribe to an event.
     * @param {string}   event
     * @param {Function} handler
     */
    on(event, handler) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(handler);
    }

    /**
     * Unsubscribe a handler.
     * @param {string}   event
     * @param {Function} handler
     */
    off(event, handler) {
        this._listeners.get(event)?.delete(handler);
    }

    /**
     * Emit an event, calling all subscribed handlers.
     * @param {string} event
     * @param {*}      payload
     */
    emit(event, payload) {
        this._listeners.get(event)?.forEach(h => h(payload));
    }

    /** Remove all listeners (useful on game reset). */
    clear() {
        this._listeners.clear();
    }
}

// Singleton
const eventBus = new EventBus();
