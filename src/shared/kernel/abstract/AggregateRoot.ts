/**
 * AggregateRoot.ts
 *
 * @author    Your Name <your.email@example.com>  
 *    
 * 
 */

import { Entity } from './Entity.js';
import { DomainEvent } from './DomainEvent.js';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}
