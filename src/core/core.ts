/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Type<T> = new (...args: any[]) => T;
export type DoneCallback = (e?: Error) => void;
interface TestFns {
  describe: (name: string, arg: () => any) => any;
  beforeAll: (arg: (done: DoneCallback) => any) => any;
  beforeEach: (arg: (done: DoneCallback) => any) => any;
  afterEach: (arg: (done: DoneCallback) => any) => any;
  afterAll: (arg: (done: DoneCallback) => any) => any;
  it: (name: string, arg: (done: DoneCallback) => any) => any;
}
interface TestMetadata {
  attr: string;
  testName: string;
}
export interface TestSuiteMetadata<C> {
  tests: TestMetadata[];
  beforeAll: string[];
  beforeEach: string[];
  afterEach: string[];
  afterAll: string[];
  config: C;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Fn = Function;

export interface PrepArgsFnReturn<S, T> {
  suite: S;
  testArgument: T;
}

export type PrepArgsFn<C, S> = (Suite: Type<unknown>, testSuiteConfig: C) => PrepArgsFnReturn<S, unknown>|Promise<PrepArgsFnReturn<S, unknown>>;
export type Spec<S, T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [P in keyof S]: S[P] extends Fn ? S[P] extends (arg: T) => any ? S[P] : never : S[P];
};

const Storage = new WeakMap<Type<unknown>, TestSuiteMetadata<unknown>>();

function getOrDefault (target: Type<unknown>): TestSuiteMetadata<unknown> {
  return Storage.get(target) ?? {
    tests: [],
    beforeAll: [],
    beforeEach: [],
    afterEach: [],
    afterAll: [],
    config: null
  };
}

function Hook (type: 'beforeAll'|'beforeEach'|'afterEach'|'afterAll'): MethodDecorator {
  return (target: any, attr: string|symbol, desc: PropertyDescriptor) => {
    const testSuite = target.constructor;
    let storage = getOrDefault(testSuite);
    storage = {
      ...storage,
      [type]: [
        ...storage[type],
        attr.toString()
      ]
    };
    Storage.set(target.constructor, storage);

    return desc;
  };
}

async function LifecycleEvent (
  configuredTests: TestSuiteMetadata<unknown>,
  event: 'beforeAll'|'beforeEach'|'afterEach'|'afterAll',
  arg: unknown,
  testSuite: any,
  done: DoneCallback
) {
  for (const hookName of configuredTests[event]) {
    try {
      await executeFunction(testSuite, hookName, arg);
    } catch (e) {
      done(e);

      return;
    }
  }
  done();
}

export function BeforeEach (): MethodDecorator {
  return Hook('beforeEach');
}

export function BeforeAll (): MethodDecorator {
  return Hook('beforeAll');
}

export function AfterEach (): MethodDecorator {
  return Hook('afterEach');
}

export function AfterAll (): MethodDecorator {
  return Hook('afterAll');
}
export const It: MethodDecorator = (target: any, attr: string|symbol, desc?: PropertyDescriptor) => {
  attr = attr.toString();
  let storage = getOrDefault(target.constructor as Type<unknown>);
  storage = {
    ...storage,
    tests: [
      ...storage.tests,
      {
        attr,
        testName: attr
      }
    ]
  };
  Storage.set(target.constructor, storage);

  return desc;
};

export function TestCase (testName?: string): MethodDecorator {
  return (target: any, attr: string|symbol, desc: PropertyDescriptor) => {
    attr = attr.toString();
    testName = attr.toString();
    let storage = getOrDefault(target.constructor);
    storage = {
      ...storage,
      tests: [
        ...storage.tests,
        {
          attr,
          testName
        }
      ]
    };
    Storage.set(target.constructor, storage);

    return desc;
  };
}

export function TestSuite<C, T, P extends Spec<P, T>> (config: C): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    let storage = getOrDefault(target as Type<unknown>);
    storage = {
      ...storage,
      config
    };

    Storage.set(target as Type<unknown>, storage);
  };
}

async function executeFunction (test: any, prop: string, arg: any) {
  if (!test) {
    throw new ReferenceError('test could not be generated check errors above');
  } else {
    return test[prop](arg);
  }
}


export function createRunner<C> (
  prepArgs: PrepArgsFn<C, unknown>,
  testRunners: TestFns = {
    describe,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
    it
  }
) {
  return function runSuite (
    Suite: Type<unknown>,
    name: string
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const configuredTests = Storage.get(Suite as Type<unknown>);

    if (!configuredTests) {
      throw new ReferenceError('Tests have not been set up for this class');
    }

    testRunners.describe(name, () => {
      let arg: any;
      let testSuite: any;

      testRunners.beforeAll(async (done: DoneCallback) => {
        const result = await prepArgs(Suite as Type<unknown>, configuredTests.config as C);
        arg = result.testArgument;
        testSuite = result.suite;
        await LifecycleEvent(configuredTests, 'beforeAll', arg, testSuite, done);
      });

      testRunners.beforeEach(async (done: DoneCallback) => {
        const result = await prepArgs(Suite as Type<unknown>, configuredTests.config as C);
        arg = result.testArgument;
        testSuite = result.suite;
        await LifecycleEvent(configuredTests, 'beforeEach', arg, testSuite, done);
      });
  
      
      configuredTests.tests.forEach(testMetadata => {
        const { testName, attr } = testMetadata;
        testRunners.it(testName, async (done: any) => {
          try {
            await executeFunction(testSuite, attr, arg);
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      testRunners.afterEach(async (done: DoneCallback) => {
        await LifecycleEvent(configuredTests, 'afterEach', arg, testSuite, done);
      });
  
      

      testRunners.afterAll(async (done: DoneCallback) => {
        await LifecycleEvent(configuredTests, 'afterAll', arg, testSuite, done);
      });
    });
  };
}

