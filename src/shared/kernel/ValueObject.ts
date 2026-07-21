export abstract class ValueObject<T extends Record<string, any>> {
  protected readonly props: T;

  constructor(props: T) {
    // Object.freeze es superficial. Si hay objetos anidados, deben ser a su vez inmutables.
    this.props = Object.freeze({ ...props });
  }

  /**
   * Comparación estructural basada en componentes de igualdad.
   * Cada subclase debe implementar getEqualityComponents().
   * Así evitamos problemas de orden y rendimiento de JSON.stringify.
   */
  abstract getEqualityComponents(): unknown[];

  equals(other?: ValueObject<T>): boolean {
    if (!other || !(other instanceof ValueObject)) {
      return false;
    }
    const thisComponents = this.getEqualityComponents();
    const otherComponents = other.getEqualityComponents();

    if (thisComponents.length !== otherComponents.length) {
      return false;
    }

    return thisComponents.every((component, index) =>
      component === otherComponents[index]
    );
  }
}