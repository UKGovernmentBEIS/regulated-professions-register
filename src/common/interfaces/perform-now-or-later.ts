import Bull from 'bull';

export type PerformNowOrLater = {
  performNow: () => Promise<void>;
  performLater: () => Promise<Bull.Job<any>>;
};
