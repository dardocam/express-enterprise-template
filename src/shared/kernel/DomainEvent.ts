import { UniqueId } from './UniqueId.js';

export abstract class DomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly eventId: UniqueId;

  constructor() {
    this.dateTimeOccurred = new Date();
    this.eventId = new UniqueId();
  }

  abstract get aggregateId(): UniqueId;
}
