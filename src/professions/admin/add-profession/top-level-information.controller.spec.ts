import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { IndustriesService } from '../../../industries/industries.service';
import { Industry } from '../../../industries/industry.entity';
import { TopLevelInformationController } from './top-level-information.controller';

describe('TopLevelInformationController', () => {
  let controller: TopLevelInformationController;
  let industriesService: DeepMocked<IndustriesService>;

  const healthIndustry = new Industry('Health');
  healthIndustry.id = 'health-uuid';
  const constructionIndustry = new Industry('Construction & Engineering');
  constructionIndustry.id = 'construction-uuid';

  const industries = [healthIndustry, constructionIndustry];

  beforeEach(async () => {
    industriesService = createMock<IndustriesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopLevelInformationController],
      providers: [{ provide: IndustriesService, useValue: industriesService }],
    }).compile();

    controller = module.get<TopLevelInformationController>(
      TopLevelInformationController,
    );
  });

  describe('new', () => {
    it('should fetch all Industries to be displayed in an option select', async () => {
      industriesService.all.mockImplementationOnce(async () => industries);

      expect(await controller.new()).toEqual({
        industriesOptionSelectArgs: [
          {
            text: 'Health',
            value: 'health-uuid',
          },
          {
            text: 'Construction & Engineering',
            value: 'construction-uuid',
          },
        ],
      });
      expect(industriesService.all).toHaveBeenCalled();
    });
  });
});
