import config from 'config';
import winston from 'winston';
const {
  combine, timestamp, colorize, printf,
} = winston.format;

type TransformableInfo = winston.Logform.TransformableInfo;

const NODE_ENV = config.get<string>('env');
const LOG_LEVEL = config.get<string>('log.level');
const LOG_DISABLED = config.get<boolean>('log.disabled');

type AnyRec = Record<string, unknown>;

function toErrorMeta(err: unknown): AnyRec | undefined {
  if (err == null) return undefined;

  if (err instanceof Error) {
    const { name, message, stack } = err;
    const extra: AnyRec = {};
    const errorObj = err as Error & Record<string, unknown>;
    for (const k of Object.keys(errorObj)) {
      if (k !== 'name' && k !== 'message' && k !== 'stack') {
        extra[k] = errorObj[k];
      }
    }
    return { name, message, stack, ...extra };
  }

  if (typeof err === 'object') return err as AnyRec;

  return { value: String(err) };
}

const loggerFormat = () => {
  const formatMessage = ({
    level, message, timestamp, ...rest
  }: TransformableInfo) => {
    return `${timestamp} | ${level} | ${message} | ${JSON.stringify(rest)}`;
  };

  const formatError = (info: TransformableInfo) => {
    const { error, ...rest } = info as AnyRec;
    const errMeta = toErrorMeta(error);

    const base = formatMessage(rest as TransformableInfo);

    const stackPart = errMeta?.['stack'] ? `\n\n${String(errMeta['stack'])}\n` : '';

    return `${base}${stackPart}`;
  };

  const format = (info: TransformableInfo) => {
    if ('error' in info && typeof (info as AnyRec).error !== 'undefined') {
      return formatError(info);
    }
    return formatMessage(info);
  };

  return combine(colorize(), timestamp(), printf(format));
};

const rootLogger: winston.Logger = winston.createLogger({
  level: LOG_LEVEL,
  format: loggerFormat(),
  defaultMeta: { env: NODE_ENV },
  transports: NODE_ENV === 'testing' ? [
    new winston.transports.File({
      filename: 'test.log',
      silent: LOG_DISABLED,
    }),
  ] : [
    new winston.transports.Console({ silent: LOG_DISABLED }),
  ],
});

export const getLogger = () => {
  return rootLogger;
};
