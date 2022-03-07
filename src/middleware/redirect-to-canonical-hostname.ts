import { Request, Response, NextFunction } from 'express';

export function redirectToCanonicalHostname(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const host = request.header('host');
  if (host === process.env['CANONICAL_HOSTNAME']) {
    next();
  } else {
    response.redirect(
      301,
      request.protocol +
        '://' +
        process.env['CANONICAL_HOSTNAME'] +
        request.url,
    );
  }
}
