import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { Auth0Service } from './auth0.service';

@Processor('auth0')
@Injectable()
export class Auth0Consumer {
  constructor(private readonly auth0Service: Auth0Service) {}

  @Process('deleteUser')
  async deleteUser(job: Job) {
    this.auth0Service.deleteUser(job.data.externalIdentifier).performNow();
  }
}
