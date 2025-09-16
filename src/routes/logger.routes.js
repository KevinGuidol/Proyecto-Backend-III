import { Router } from 'express';
import { getLogger } from '../utils/logger.js';

export const loggerRouter = Router();
const logger = getLogger();

loggerRouter.get('/', (req, res) => {
  logger.debug('Log de prueba: DEBUG');
  logger.http('Log de prueba: HTTP');
  logger.info('Log de prueba: INFO');
  logger.warning('Log de prueba: WARNING');
  logger.error('Log de prueba: ERROR');
  logger.fatal('Log de prueba: FATAL');
  res.send('Logs de prueba generados');
});
