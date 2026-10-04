# 📦 InventoryModule Master Guide (`inventorymodule.md`)

Bu sənəd `libs/inventory/src/lib/inventory.module.ts` faylındakı `InventoryModule` modulunun tərkibini izah edir.

---

## 🏛️ Modulun Quruluşu

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Poster.name, schema: PosterSchema }]),
  ],
  controllers: [InventoryController],
  providers: [CloudinaryService, InventoryService],
  exports: [CloudinaryService, InventoryService],
})
export class InventoryModule {}
```

---

## 🧩 Əsas Tərkib Hissələri:

1. **`MongooseModule.forFeature(...)`**:
   `Poster` modelini və `PosterSchema`-nı `InventoryService` daxilində `@InjectModel(Poster.name)` ilə istifadə etməyə şərait yaradır.

2. **`controllers`**:
   `InventoryController` HTTP marşrutlarını qeydiyyata alır (`/api/inventory`).

3. **`providers`**:
   `CloudinaryService` və `InventoryService` servislərini NestJS-in **Dependency Injection (DI)** konteynerinə daxil edir.

4. **`exports`**:
   `CloudinaryService` və `InventoryService`-i gələcəkdə digər modullar (məsələn: `OrderModule`) üçün də əlçatan edir.
