import { Injectable } from '@angular/core';
import { MockAngularProvider } from '@simple-deck/test-decorators/angular/helpers';
import { AppService } from './app.service';

@Injectable({ providedIn: 'root' })
export class AppServiceMock extends AppService {
  returnsAValue (): string {
    return 'a mocked value';
  }
}

export const APP_SERVICE_MOCK = MockAngularProvider(AppServiceMock, AppService);
