import { Injectable, Injector, Provider } from '@angular/core';
import { Type } from '../core';

export function MockAngularProvider<O, M extends O> (
  mockedClass: Type<M>,
  originalClass: Type<O>
): Provider {
  let val: Mocked;
  const constructorArgs: ConstructorParameters<Type<M>> = Reflect.getMetadata('design:paramtypes', mockedClass) || Reflect.getMetadata('design:paramtypes', originalClass) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockedClass = mockedClass as Type<any>;

  @Injectable({ providedIn: 'root' })
  class Mocked extends MockedClass {
    constructor (
      injector: Injector
    ) {
      super(...constructorArgs.map((item: unknown) => injector.get(item)));
      if (val) {
        return val;
      } else {
        val = this;
      }
    }
  }

  return {
    provide: originalClass,
    useClass: Mocked
  };
}
