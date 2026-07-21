export abstract class Identifier<T> {
  // Constructor protegido: solo se puede heredar, no instanciar directamente.
  protected constructor(protected readonly value: T) {}

  // Permite comparar cualquier Identifier (sin importar el tipo concreto T)
  equals(other?: Identifier<any>): boolean {
    if (!other || !(other instanceof Identifier)) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }

  getValue(): T {
    return this.value;
  }
}