import { Request, Response } from 'express';
import { User } from 'src/entity/User';

export interface Context {
  req: Request,
  res: Response
  user?: User;
  url: string;
}