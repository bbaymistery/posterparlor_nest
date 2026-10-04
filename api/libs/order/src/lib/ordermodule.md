# 📦 OrderModule — Ətraflı İzahlı Sənəd

Salam tələbəm! 👨‍🏫 Bu sənəd **[`orders.module.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/src/lib/orders.module.ts)** faylının NestJS monorepo daxilindəki rolunu izah edir.

---

## 📌 1. Modulun Rolu Və Vəzifəsi

`OrderModule` e-ticarət tətbiqimizin ödəniş və sifariş prosesini idarə edən mərkəzi blokdur. Aşağıdakı Mongoose modellərini və servislərini özündə birləşdirir:

* **`Order` Model**: Sifarişlərin bazada saxlanması.
* **`Poster` Model**: Sifariş verilən posterin qiymətinin və anbardakı stok sayının yoxlanıb azaldılması.
* **`User` Model**: Sifariş verən istifadəçinin profil məlumatlarının birləşdirilməsi.
* **`OrdersService`**: Biznes və hesablama loqikası.
* **`PaymentService`**: Stripe Sandbox ödəniş inteqrasiyası.

---

## 🔍 2. Kod Əsasında Hissələrin İzahı

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Poster.name, schema: PosterSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PaymentService],
  exports: [OrdersService, PaymentService],
})
export class OrderModule {}
```

* **`MongooseModule.forFeature`**: Sifariş yaradılarkən eyni anda 3 kolleksiyaya (`orders`, `posters`, `users`) müraciət olunduğu üçün 3 model də bu modula bağlanır.
* **`providers`**: `OrdersService` və `PaymentService` NestJS Dependency Injection konteynerinə daxil edilir.
* **`exports`**: Başqa modullar bu servislərdən istifadə edə bilsin deyə xaricə eksport olunur.
