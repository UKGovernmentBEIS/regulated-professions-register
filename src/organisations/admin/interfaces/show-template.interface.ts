import { ShowTemplate as PublicShowTemplate } from '../../interfaces/show-template.interface';

export interface ShowTemplate extends PublicShowTemplate {
  log: {
    lastModified: string;
    changedBy: {
      name: string;
      email: string;
    };
  };
  hasLiveVersion: boolean;
}
