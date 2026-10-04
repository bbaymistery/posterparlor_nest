# 📦 AuthModule Master Guide (`authmodule.md`)

Bu sənəd `libs/auth/src/lib/auth.module.ts` faylındakı `AuthModule` modulunun bütün auth komponentlərini necə bir yerə topladığını izah edir.

---

## 🏛️ Modulun Quruluşu

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (config: AppConfigService) => ({
        secret: config.authConfig.jwtRefreshTokenSecret,
        signOptions: { expiresIn: config.authConfig.jwtRefreshTokenExpiry },
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [GoogleAuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RoleGuard],
  exports: [AuthService, JwtStrategy, JwtAuthGuard, RoleGuard],
})
export class AuthModule {}
```

---

## 🧩 Əsas Tərkib Hissələri:

1. **`MongooseModule.forFeature(...)`**:
   `User` modelini `AuthService` və `JwtStrategy` daxilində `@InjectModel(User.name)` ilə istifadə etməyə şərait yaradır.

2. **`PassportModule.register({ defaultStrategy: 'jwt' })`**:
   NestJS-ə deyir ki, susmaya görə autentifikasiya strategiyası `jwt` adlanır.

3. **`JwtModule.registerAsync(...)`**:
   JWT tokenlərini imzalamaq üçün `jwtRefreshTokenSecret` və vaxtlarını `.env` faylından `AppConfigService` vasitəsilə asinxron oxuyur.

4. **`providers`**:
   `AuthService`, `JwtStrategy`, `JwtAuthGuard` və `RoleGuard` klaslarını NestJS-in **Dependency Injection (DI)** konteynerinə qeydiyyata alır.

5. **`exports`**:
   Bu modulu başqa modullar (məsələn: `AppModule`) import etdikdə, `AuthService` və `JwtAuthGuard`-ı orada da istifadə etməyə icazə verir.
