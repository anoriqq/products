import { Request, Response, NextFunction } from 'express';
import debug from 'debug';

const log = debug('app:error');

export function embedBundlePathToLocals(req: Request, res: Response, next: NextFunction) {
  res.locals.bundlePath = `js`;
  return next();
};

export function notFoundError(req: Request, res: Response, next: NextFunction) {
  res.status(404);

  if (req.accepts('html')) {
    res.render('404', {
      error: 'Not found',
      title: 'Not found',
      message: 'ページが見つかりません',
    });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    return res.send({error: 'Not found', message: 'ページが見つかりません'});
  }

  // default to plain-text. send()
  return res.type('txt').send('Not found');
}

export function serverError(err: any, req: Request, res: Response, next: NextFunction) {
  log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  return res.render('error', {title: 'Sorry', err});
}
