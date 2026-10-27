import { randomUUID } from 'node:crypto';
import { defineEntity, p } from '@mikro-orm/core';

export const UserSchema = defineEntity({
  name: 'User',
  tableName: 'app_user',
  properties: {
    id: p.uuid().primary().onCreate(() => randomUUID()),
    email: p.string().unique(),
    passwordHash: p.string(),
    role: p.enum(['user', 'admin']).default('user'),
    isActive: p.boolean().default(true),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class User extends UserSchema.class {}

UserSchema.setClass(User);

export const RefreshTokenSchema = defineEntity({
  name: 'RefreshToken',
  tableName: 'refresh_token',
  properties: {
    id: p.uuid().primary().onCreate(() => randomUUID()),
    tokenHash: p.string().unique(),
    user: () => p.manyToOne(User).fieldName('user_id').index(),
    expiresAt: p.datetime(),
    revokedAt: p.datetime().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class RefreshToken extends RefreshTokenSchema.class {}

RefreshTokenSchema.setClass(RefreshToken);
