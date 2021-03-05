import { Injectable } from '@angular/core';
import { Spec, TestCase } from '@simple-deck/test-decorators';
import { DescribeAngularService } from '@simple-deck/test-decorators/angular';
import { AppService } from './app.service';

@DescribeAngularService(AppService, { })
@Injectable({ providedIn: 'root' })
export class AppServiceSpec implements Spec<AppServiceSpec, AppService> {
  @TestCase('should be able to return a mocked value')
  testShouldReturnValue (service: AppService): void {
    expect(service.returnsAValue()).toBe('a value');
  }
}
