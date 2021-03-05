import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppService {
  returnsAValue (): string {
    return 'a value';
  }
}
