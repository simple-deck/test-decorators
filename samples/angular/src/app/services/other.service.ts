import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable({ providedIn: 'root' })
export class OtherService {
  constructor (
    private appService: AppService
  ) { }
  returnsAnotherValue (): string {
    return this.appService.returnsAValue();
  }
}
