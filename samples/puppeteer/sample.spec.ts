import { Spec, TestCase } from '@simple-deck/test-decorators';
import { DescribeWebApp } from '@simple-deck/test-decorators/puppeteer';
import { Page } from 'puppeteer';

@DescribeWebApp('google.com', {
  headless: true,
  reuseBrowser: true,
  defaultRoute: 'https://google.com'
})
export class SampleSpec implements Spec<SampleSpec, Page> {
  @TestCase('should be able to see google.com')
  async testShouldSeeGoogle (page: Page): Promise<void> {
    const title = await page.title();
    expect(title.toLowerCase()).toContain('google');
  }
}
