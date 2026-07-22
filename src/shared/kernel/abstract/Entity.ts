import { UniqueId } from '../id/UniqueId.js';

export abstract class Entity<T> {
  protected readonly _id: UniqueId;
  protected readonly props: T;

  constructor(props: T, id?: UniqueId) {
    this._id = id || new UniqueId();
    this.props = props;
  }

  get id(): UniqueId {
    return this._id;
  }

  /**
   * Compara dos entidades por su identidad, no por sus atributos.
   * En DDD, dos entidades con distinto tipo pero mismo ID no deberían considerarse iguales.
   * Por eso mantenemos la verificación de instancia, pero aceptamos cualquier Entity.
   */
  equals(other?: Entity<any>): boolean {
    if (!other || !(other instanceof Entity)) {
      return false;
    }
    return this._id.equals(other._id);
  }
}