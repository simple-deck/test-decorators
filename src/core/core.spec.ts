/* eslint-disable @typescript-eslint/no-explicit-any */
import { BeforeEach, createRunner, DoneCallback, TestCase, TestSuite, Type } from './core';
/**
 * Emulate jest functions 'describe', 'it', etc.
 * 
 * must call `run` after all functions are registered
 */
class MockRunners {
  private beforeAllFns: ((done: DoneCallback) => any)[] = [];
  private beforeEachFns: ((done: DoneCallback) => any)[] = [];
  private itFns: {name: string; test: ((done: DoneCallback) => any)}[] = [];
  private afterAllFns: ((done: DoneCallback) => any)[] = [];
  private afterEachFns: ((done: DoneCallback) => any)[] = [];
  describe (_name: string, fn: (done: DoneCallback) => any) {
    fn(() => ({}));
  }
  beforeEach (fn: (done: DoneCallback) => any) {
    this.beforeEachFns.push(fn);
  }

  beforeAll (fn: (done: DoneCallback) => any) {
    this.beforeAllFns.push(fn);
  }

  it (name: string, test: (done: DoneCallback) => any) {
    this.itFns.push({
      name,
      test
    });
  }

  private async runIt (_name: string, fn: (done: DoneCallback) => any) {
    for (const _fn of this.beforeAllFns) {
      await _fn(() => ({}));
    }
    this.beforeAllFns = [];
    for (const _fn of this.beforeEachFns) {
      await _fn(() => ({}));
    }
    await fn(() => ({}));
    for (const _fn of this.afterEachFns) {
      await _fn(() => ({}));
    }
    this.beforeAllFns = [];
    for (const _fn of this.beforeEachFns) {
      await _fn(() => ({}));
    }
  }

  afterEach (fn: (done: DoneCallback) => any) {
    this.afterEachFns.push(fn);
  }

  afterAll (fn: (done: DoneCallback) => any) {
    this.afterAllFns.push(fn);
  }

  async run () {
    for (const itFn of this.itFns) {
      await this.runIt(itFn.name, itFn.test);
    }
  }
}

describe('core test runner', () => {
  it('should be able to run argument preparation with config', async () => {
    const initialConfig = {};
    const arg = 'arg';

    let prepArgsHasRun = false;
    const jestMock = new MockRunners();

    const sampleRunner = createRunner((suite: Type<unknown>, config: unknown) => {
      expect(config).toEqual(initialConfig);
      expect(suite).toEqual(MyTestSuite);

      prepArgsHasRun = true;

      return {
        testArgument: arg,
        suite: new suite()
      };
    }, undefined, jestMock);


    @TestSuite(initialConfig)
    class MyTestSuite {
      @TestCase('')
      test () {
        return;
      }
    }

    sampleRunner(MyTestSuite, 'arg');
    await jestMock.run();

    expect(prepArgsHasRun).toBeTruthy();
  });

  it('should be able to run a test', async () => {
    const initialConfig = {};
    const arg = 'arg';

    let testHasRun = false;

    const jestMock = new MockRunners();

    const sampleRunner = createRunner(async (suite: Type<unknown>) => {
      return {
        testArgument: arg,
        suite: new suite()
      };
    }, undefined, jestMock);


    @TestSuite(initialConfig)
    class MyTestSuite {
      @TestCase('')
      test (testArg: unknown) {
        expect(testArg).toEqual(arg);
        testHasRun = true;

        return;
      }
    }

    sampleRunner(MyTestSuite, 'arg');
    await jestMock.run();

    expect(testHasRun).toBeTruthy();
  });


  it('should be able to run a beforeEach', async () => {
    const initialConfig = {};
    const arg = 'arg';

    const jestMock = new MockRunners();

    const sampleRunner = createRunner(async (suite: Type<unknown>) => {
      return {
        testArgument: arg,
        suite: new suite()
      };
    }, undefined, jestMock);

    let beforeEachRun = false;
    let testHasRun = false;

    @TestSuite(initialConfig)
    class MyTestSuite {
      @BeforeEach()
      beforeEach () {
        beforeEachRun = true;
      }

      @TestCase('')
      test () {
        expect(beforeEachRun).toBeTruthy();
        testHasRun = true;

        return;
      }
    }

    sampleRunner(MyTestSuite, 'arg');
    await jestMock.run();

    expect(beforeEachRun).toBeTruthy();
    expect(testHasRun).toBeTruthy();
  });
});
