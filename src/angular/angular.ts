import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'reflect-metadata';
import { createRunner, PrepArgsFnReturn, Spec, TestSuite, Type } from '../core/core';

export enum TestTypes {
  Component,
  Service
}

/**
 * @property target The class (e.g. component, service, pipe) that is being tested 
 */
interface DescribeConfig extends NgModule {
  type: TestTypes;
  target: Type<unknown>;
}


function defaultConfig (
  Suite: Type<unknown>,
  config: DescribeConfig
): DescribeConfig {
  return {
    ...config,
    declarations: [
      ...(config.declarations || []).concat(config.type !== TestTypes.Service ? [config.target] : [])
    ],
    providers: [
      ...(config.providers || []).concat(config.type === TestTypes.Service ? [config.target] : []),
      Suite
    ],
    schemas: config.type === TestTypes.Component ? [
      ...(config.schemas || []),
      NO_ERRORS_SCHEMA,
      CUSTOM_ELEMENTS_SCHEMA
    ] : (config.schemas || [])
  };
}

const runner = createRunner((
  Suite: Type<unknown>,
  configuredTests: DescribeConfig,
  test: unknown|null
): Promise<PrepArgsFnReturn<unknown, unknown>> => {
  configuredTests = defaultConfig(Suite, configuredTests);
  const mod = TestBed.configureTestingModule(configuredTests);
  let arg: unknown;

  return mod
    .compileComponents()
    .then(() => {
      if (!test) {
        test = mod.inject(Suite);
      }
      switch (configuredTests.type) {
        case TestTypes.Service:
          arg = mod.inject(configuredTests.target);

          break;
        case TestTypes.Component:
          arg = TestBed.createComponent(configuredTests.target);
          break;
      }

      return {
        testArgument: arg,
        suite: test
      };
    });
});

export function DescribeAngularComponent<T, P extends Spec<P, ComponentFixture<T>>> (target: Type<T>, ngModule: NgModule) {
  return (suite: Type<P>): void => {
    Injectable({ providedIn: 'root' })(target);

    TestSuite<DescribeConfig, unknown, Spec<unknown, unknown>>({
      ...ngModule,
      type: TestTypes.Component,
      target
    })(suite);

    runner(suite as Type<unknown>, target.name);
  };
}


export function DescribeAngularService<T, P extends Spec<P, T>> (target: Type<T>, ngModule: NgModule) {
  return (suite: Type<P>): void => {
    Injectable({ providedIn: 'root' })(target);

    TestSuite<DescribeConfig, unknown, Spec<unknown, unknown>>({
      ...ngModule,
      type: TestTypes.Service,
      target
    })(suite);

    runner(suite as Type<unknown>, target.name);
  };
}

