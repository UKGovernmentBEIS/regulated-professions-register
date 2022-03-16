import { PublicationBlocker } from '../../helpers/get-publication-blockers.helper';
import { ShowTemplate as PublicShowTemplate } from '../../interfaces/show-template.interface';

export interface ShowTemplate extends PublicShowTemplate {
  hasLiveVersion: boolean;
  publicationBlockers: PublicationBlocker[];
}
