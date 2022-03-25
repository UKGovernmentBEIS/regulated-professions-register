import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class LandingController {
  @Get()
  @Render('index')
  index(): void {
    // do nothing.
  }
}
