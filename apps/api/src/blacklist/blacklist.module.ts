import { Global, Module } from '@nestjs/common';
import { BlacklistConfig } from './blacklist.config';

@Global()
@Module({
  providers: [BlacklistConfig],
  exports: [BlacklistConfig],
})
export class BlacklistModule {}
