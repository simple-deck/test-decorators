import { Injectable } from '@angular/core';
import { Spec, TestCase } from '@simple-deck/test-decorators';
import { DescribeAngularService } from '@simple-deck/test-decorators/angular';
import { APP_SERVICE_MOCK } from './app.service.mock';
import { OtherService } from './other.service';

@DescribeAngularService(OtherService, {
  providers: [APP_SERVICE_MOCK]
})
@Injectable({ providedIn: 'root' })
export class OtherServiceSpec implements Spec<OtherServiceSpec, OtherService> {
  @TestCase('should be able to return a value')
  testShouldReturnValue (service: OtherService): void {
    expect(service.returnsAnotherValue()).toBe('a mocked value');
  }
}
