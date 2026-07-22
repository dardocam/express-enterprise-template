import { UniqueId } from '../id/UniqueId.js';

export abstract class DomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly eventId: string;

  constructor() {
    this.dateTimeOccurred = new Date();
    this.eventId = new UniqueId().toString();
  }

  abstract get aggregateId(): string;

  /**
   * Nombre único del evento. Por convención, puede ser el nombre de la clase.
   * Facilita el enrutamiento en buses de eventos.
   */
  get eventType(): string {
    return this.constructor.name;
  }
}