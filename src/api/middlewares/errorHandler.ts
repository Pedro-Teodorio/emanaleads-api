import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err); // Log do erro para depuração

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Para erros inesperados
  return res.status(500).json({ message: 'Erro interno do servidor.' });
};
