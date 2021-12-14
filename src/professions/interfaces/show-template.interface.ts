import { Profession } from '../profession.entity';

export interface ShowTemplate {
  profession: Profession;
  nations: string[];
  backUrl: string;
}
