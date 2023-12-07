/* eslint-disable no-console */
/* eslint-disable global-require */
describe('test help function', () => {
  // Mock console.log
  const originalConsoleLog = console.log;
  let consoleLogCalls = [];

  beforeAll(() => {
    console.log = jest.fn(message => {
      consoleLogCalls.push(message);
      originalConsoleLog(message);
    });
  });

  beforeEach(() => {
    consoleLogCalls = [];
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  it('should be able to display help command', () => {
    jest.doMock('glob', () => ({
      sync: jest.fn().mockReturnValue([]),
    }));

    const { execSync } = require('child_process');
    const expectedVersion = execSync('npm view lesgo version')
      .toString()
      .trim();
    const consoleSpy = jest.spyOn(console, 'log');
    const {
      help,
      colorize,
      optionsList,
      optionsTabPrefix,
    } = require('../../../bin/lesgo');

    help();

    expect(consoleSpy).toHaveBeenCalledTimes(7);
    expect(consoleLogCalls[0]).toEqual(
      `Lesgo Framework ${colorize(expectedVersion, 'green')}`
    );
    expect(consoleLogCalls[1]).toEqual(colorize('\nUsage:', 'yellow'));
    expect(consoleLogCalls[2]).toEqual(`  command [options] [arguments]`);
    expect(consoleLogCalls[3]).toEqual(colorize('\nOptions:', 'yellow'));

    optionsList.forEach(option => {
      expect(consoleLogCalls).toContain(
        `${colorize(`  ${option.signature}`, 'green')}${Array(optionsTabPrefix)
          .fill(' ')
          .join('')}${option.description}`
      );
    });

    expect(consoleLogCalls).toContain(
      colorize('\nAvailable commands:', 'yellow')
    );
  });
});

describe('test findAndRequireCommands function', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('should be able to execute findAndRequireCommands callback', () => {
    jest.doMock('@babel/core', () => ({
      transformFileSync: jest.fn().mockReturnValue({
        code: 'console.log("test");',
      }),
    }));
    jest.doMock('glob', () => ({
      sync: jest.fn().mockReturnValue(['test-command-file']),
    }));
    jest.doMock('path', () => ({
      resolve: jest.fn().mockImplementation(() => 'test-command-file'),
      basename: jest.fn().mockImplementation(val => val),
      dirname: jest.fn().mockImplementation(val => `${__dirname}/${val}`),
    }));
    jest.doMock('fs', () => ({
      mkdirSync: jest.fn(),
      writeFileSync: jest.fn(),
    }));

    const { findAndRequireCommands } = require('../../../bin/lesgo');

    const callbackFn = jest.fn().mockImplementation(() => true);

    findAndRequireCommands(callbackFn);

    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledWith('test', 'test:command', {
      signature: 'test:command',
    });
  });
});

describe('test getCommandParams function', () => {
  beforeEach(() => {
    jest.doMock('glob', () => ({
      sync: jest.fn().mockReturnValue([]),
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('returns the correct options and arguments', () => {
    const { getCommandParams } = require('../../../bin/lesgo');

    const command = {
      signature: '{--bool}',
    };

    const argv = [null, null, '--bool'];
    process.argv = argv;

    const expectedResult = [{}, { bool: true }];

    expect(getCommandParams(command)).toEqual(expectedResult);
  });

  test('returns the default value when no value is provided', () => {
    const { getCommandParams } = require('../../../bin/lesgo');

    const command = {
      signature: '{--bool=false}',
    };

    const argv = [null, null];
    process.argv = argv;

    const expectedResult = [{}, { bool: 'false' }];

    expect(getCommandParams(command)).toEqual(expectedResult);
  });
});
