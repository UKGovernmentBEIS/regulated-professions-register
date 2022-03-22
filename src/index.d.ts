declare global {
  interface Session {
    searchResultUrl?: string;
  }
  namespace Express {
    interface Request {
      session: Session;
    }
  }
}
export {};
