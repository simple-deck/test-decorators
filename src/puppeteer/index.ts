import { Browser, launch, Page } from 'puppeteer';
import 'reflect-metadata';
import { createRunner, PrepArgsFnReturn, Spec, TestSuite, Type } from '../core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const browserStorage = new WeakMap<any, Browser>();

interface PuppeteerOptions {
  headless: boolean;
  reuseBrowser: boolean;
  defaultRoute?: string;
}

const runner = createRunner(async (
  Suite: Type<unknown>,
  configuredTests: PuppeteerOptions,
  test: unknown|null,
  _: unknown,
  isInitialRun: boolean
): Promise<PrepArgsFnReturn<unknown, unknown>> => {
  if (!test) {
    test = new Suite();
  }
  let existingBrowser = browserStorage.get(test) ?? null;
  if (existingBrowser && !configuredTests.reuseBrowser) {
    await existingBrowser.close();
    existingBrowser = null;
  }

  if (!existingBrowser) {
    existingBrowser = await launch({
      headless: configuredTests.headless
    });

    browserStorage.set(test, existingBrowser);
  }

  let page: Page|null = null;

  if (!isInitialRun) {
    page = await existingBrowser.newPage();

    if (configuredTests.defaultRoute) {
      await page.goto(configuredTests.defaultRoute);
    }
  }

  return {
    testArgument: page,
    suite: test
  };
}, async (
  _: Type<unknown>,
  configuredTests: PuppeteerOptions,
  test: unknown|null,
  arg: unknown,
  final: boolean
): Promise<void> => {
  const existingBrowser = browserStorage.get(test);

  if (final && existingBrowser) {
    await existingBrowser.close();
  }
});

export function DescribeWebApp<P extends Spec<P, Page>> (scope: string, options: PuppeteerOptions = {
  headless: false,
  reuseBrowser: true
}) {
  return (suite: Type<P>): void => {
    TestSuite<PuppeteerOptions, unknown, Spec<unknown, unknown>>(options)(suite);

    runner(suite as Type<unknown>, scope);
  };
}
