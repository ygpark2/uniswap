import { LoggerService, LogLevel, LogOutput } from './logger.service';

const logMethods = ['log', 'info', 'warn', 'error'];

describe('LoggerService', () => {
  let savedConsole: any[];
  let savedLevel: LogLevel;
  let savedOutputs: LogOutput[];

  beforeAll(() => {
    savedConsole = [];
    logMethods.forEach((m) => {
      savedConsole[m] = console[m];
      console[m] = () => {};
    });
    savedLevel = LoggerService.level;
    savedOutputs = LoggerService.outputs;
  });

  beforeEach(() => {
    LoggerService.level = LogLevel.Debug;
  });

  afterAll(() => {
    logMethods.forEach((m) => {
      console[m] = savedConsole[m];
    });
    LoggerService.level = savedLevel;
    LoggerService.outputs = savedOutputs;
  });

  it('should create an instance', () => {
    expect(new LoggerService()).toBeTruthy();
  });

  it('should add a new LogOutput and receives log entries', () => {
    // Arrange
    const outputSpy = jest.fn();
    const log = new LoggerService('test');

    // Act
    LoggerService.outputs.push(outputSpy);

    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e', { error: true });

    // Assert
    expect(outputSpy).toHaveBeenCalled();
    expect(outputSpy.mock.calls.length).toBe(4);
    expect(outputSpy).toHaveBeenCalledWith('test', LogLevel.Debug, 'd');
    expect(outputSpy).toHaveBeenCalledWith('test', LogLevel.Info, 'i');
    expect(outputSpy).toHaveBeenCalledWith('test', LogLevel.Warning, 'w');
    expect(outputSpy).toHaveBeenCalledWith('test', LogLevel.Error, 'e', { error: true });
  });

  it('should add a new LogOutput and receives only production log entries', () => {
    // Arrange
    const outputSpy = jest.fn();
    const log = new LoggerService('test');

    // Act
    LoggerService.outputs.push(outputSpy);
    LoggerService.enableProductionMode();

    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e', { error: true });

    // Assert
    expect(outputSpy).toHaveBeenCalled();
    expect(outputSpy.mock.calls.length).toBe(2);
    expect(outputSpy).toHaveBeenCalledWith('test', LogLevel.Warning, 'w');
    expect(outputSpy).toHaveBeenCalledWith('test', LogLevel.Error, 'e', { error: true });
  });
});
