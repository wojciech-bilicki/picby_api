import { Request, Response } from 'express';

export interface Context {
  req: Request & {session: Express.Session},
  res: Response
  url: string;
}