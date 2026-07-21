import { Identifier } from './Identifier.js';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class UniqueId extends Identifier<string> {
  constructor(id?: string) {
    if (id) {
      if (!uuidValidate(id)) {
        throw new Error(`El valor '${id}' no es un UUID válido`);
      }
      super(id);
    } else {
      super(uuidv4());
    }
  }
}