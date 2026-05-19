import config from 'config';
import winston from 'winston';
const {
  combine, timestamp, colorize, printf,
} = winston.format;

// Alias the TransformableInfo type from winston's Logform to avoid missing name errors
type TransformableInfo = winston.Logform.TransformableInfo;

const NODE_ENV = config.get<string>('env');
const LOG_LEVEL = config.get<string>('log.level');
const LOG_DISABLED = config.get<boolean>('log.disabled');

type AnyRec = Record<string, unknown>;

/** Maak van unknown een veilig logbaar error-object */
function toErrorMeta(err: unknown): AnyRec | undefined {
  if (err == null) return undefined;

  if (err instanceof Error) {
    const { name, message, stack } = err;
    // Neem eventuele extra enumerable props mee (bv. code/status)
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
    // haal error veilig uit info, en log de rest via formatMessage
    const { error, ...rest } = info as AnyRec;
    const errMeta = toErrorMeta(error);

    // basislijn zonder de ruwe error (komt zo meteen apart)
    const base = formatMessage(rest as TransformableInfo);

    // stack apart eronder (zoals je had), andere meta blijft in JSON bovenaan
    const stackPart = errMeta?.['stack'] ? `\n\n${String(errMeta['stack'])}\n` : '';

    return `${base}${stackPart}`;
  };

  const format = (info: TransformableInfo) => {
    // enkel naar formatError als er effectief een error werd meegegeven
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
