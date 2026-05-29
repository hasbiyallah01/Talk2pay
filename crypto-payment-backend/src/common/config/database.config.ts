import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MerchantEntity } from '../../entities/merchant.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { TransactionEntity } from '../../entities/transaction.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [MerchantEntity, PaymentEntity, TransactionEntity],
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  ssl: { rejectUnauthorized: false }, // Force SSL for Render PostgreSQL
  retryAttempts: 3,
  retryDelay: 3000,
  autoLoadEntities: true,
  connectTimeoutMS: 10000,
  extra: {
    connectionTimeoutMillis: 10000,
  },
};
