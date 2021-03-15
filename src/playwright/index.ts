import { Browser, chromium, devices, firefox, Page, webkit } from 'playwright';
import 'reflect-metadata';
import { createRunner, PrepArgsFnReturn, Spec, TestSuite, Type } from '../core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const browserStorage = new WeakMap<any, Browser>();

interface PlaywrightOptions {
  headless: boolean;
  browser: 'webkit'|'chromium'|'firefox';
  useNewContext?: boolean;
  device?: typeof devices[string];
  defaultRoute?: string;
}

const runner = createRunner(async (
  _: Type<unknown>,
  configuredTests: PlaywrightOptions,
  test: unknown|null
): Promise<PrepArgsFnReturn<unknown, unknown>> => {
  let existingBrowser = browserStorage.get(test) ?? null;

  if (!existingBrowser) {
    existingBrowser = await createBrowser(configuredTests);

    browserStorage.set(test, existingBrowser);
  }

  let page: Page;

  if (configuredTests.useNewContext) {
    const context = await existingBrowser.newContext({
      ...(configuredTests.device ?? {})
    });
    page = await context.newPage()  
  } else {
    page = await existingBrowser.newPage();
  }


  if (configuredTests.defaultRoute) {
    await page.goto(configuredTests.defaultRoute);
  }

  return {
    testArgument: page,
    suite: test
  };
}, async (
  _: Type<unknown>,
  configuredTests: PlaywrightOptions,
  test: unknown|null,
  arg: unknown,
  final: boolean
): Promise<void> => {
  const existingBrowser = browserStorage.get(test);

  if (final && existingBrowser) {
    await existingBrowser.close();
  }
});

function createBrowser (configuredTests: PlaywrightOptions): Promise<Browser> {
  switch (configuredTests.browser) {
    case 'chromium':
      return chromium.launch({
        ...configuredTests.device,
        headless: configuredTests.headless
      });
    case 'firefox':
      return firefox.launch({
        ...configuredTests.device,
        headless: configuredTests.headless
      });
    case 'webkit':
      return webkit.launch({
        ...configuredTests.device,
        headless: configuredTests.headless
      });
  }
}

export function DescribeWebApp<P extends Spec<P, Page>> (scope: string, options: PlaywrightOptions = {
  headless: false,
  browser: 'chromium',
  useNewContext: false
}) {
  return (suite: Type<P>): void => {
    TestSuite<PlaywrightOptions, unknown, Spec<unknown, unknown>>(options)(suite);

    runner(suite as Type<unknown>, scope);
  };
}
