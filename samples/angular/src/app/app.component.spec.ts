import { ComponentFixture } from '@angular/core/testing';
import { Spec, TestCase } from '@simple-deck/test-decorators';
import { DescribeAngularComponent } from '@simple-deck/test-decorators/angular';
import { AppComponent } from './app.component';

@DescribeAngularComponent(AppComponent, { })
export class AppComponentSpec implements Spec<AppComponentSpec, ComponentFixture<AppComponent>> {

  @TestCase('should create the app')
  testShouldCreateApp (fixture: ComponentFixture<AppComponent>): void {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  }

  @TestCase(`should have as title 'angular'`)
  testShouldHaveAngularTitle (fixture: ComponentFixture<AppComponent>): void {
    const app = fixture.componentInstance;
    expect(app.title).toEqual('angular');
  }

  @TestCase('should render title')
  testShouldRenderTitle (fixture: ComponentFixture<AppComponent>): void {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('angular app is running!');
  }
}
