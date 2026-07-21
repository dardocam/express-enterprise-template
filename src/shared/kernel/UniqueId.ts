import { Identifier } from './Identifier';
import { v4 as uuidv4, validate } from 'uuid';

export class UniqueId extends Identifier<string> {
  constructor(id?: string) {
    super(id || uuidv4());
    if (!validate(this.toValue())) {
      throw new Error('Invalid UUID');
    }
  }
}
