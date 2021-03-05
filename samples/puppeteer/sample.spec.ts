import { DescribeWebApp, Spec, TestCase } from '@simple-deck/test-decorators';
import { Page } from 'puppeteer';

@DescribeWebApp('google.com', {
  headless: false,
  reuseBrowser: true,
  defaultRoute: 'https://google.com'
})
export class SampleSpec implements Spec<SampleSpec, Page> {
  @TestCase('should be able to see google.com')
  testShouldSeeGoogle (page: Page): void {
    expect(page.title).toContain('google');
  }
}
