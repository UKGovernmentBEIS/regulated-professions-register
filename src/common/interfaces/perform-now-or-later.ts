import { ApiResponse } from 'auth0/dist/cjs/lib/models';
import Bull from 'bull';

export type PerformNowOrLater = {
  performNow: () => Promise<ApiResponse<void>>;
  performLater: () => Promise<Bull.Job<any>>;
};
