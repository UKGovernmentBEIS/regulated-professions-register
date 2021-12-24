export class FilterDto {
  keywords = '';
  nations: string[] = [];
  organisations?: string[] = [];
  industries?: string[] = [];
  changedBy?: string[] = [];
}
