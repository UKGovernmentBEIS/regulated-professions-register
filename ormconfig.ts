process.env.NODE_ENV ||= 'development';

import { ConfigModule } from '@nestjs/config';
import dbConfiguration from './src/config/db.config';

ConfigModule.forRoot({
  isGlobal: true,
  load: [dbConfiguration],
});

export default dbConfiguration();
