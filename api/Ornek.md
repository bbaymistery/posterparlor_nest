# 💡 TypeScript Və NestJS Nümunələri (`Ornek.md`)

Salam tələbəm! 👨‍🏫 Bu faylda biz iki vacib suala ən sadə, real həyat nümunələri ilə cavab tapırıq:
1. **Niyə dəyişənlərin qabağına `private` yazırıq?**
2. **Niyə `constructor(private readonly connection: Connection)` şəklində mötərizənin daxilində yazırıq?**

---

## ❓ 1. Niyə `private` Yazırıq? (Məhrəmlik Və Təhlükəsizlik 🔒)

### 🏦 Real Həyat Nümunəsi: Bank Hesabı

Təsəvvür et ki, sənin bank hesabın var. Hesabındakı pulu (`balance`) küçədən keçən hər kəs dəyişə bilməlidir, yoxsa yalnız bankın öz qaydaları ilə dəyişməlidir?

#### ❌ Nümunə 1: `private` yazmasaq (`public` olsa):
```typescript
class BankAccount {
  balance: number = 100; // 🔓 Hər kəsə açıqdır!
}

const account = new BankAccount();
account.balance = -999999; // 😱 DƏHŞƏT! Kənardan biri pulumuzu mənfi etdi!
```

#### ✅ Nümunə 2: `private` yazsaq:
```typescript
class BankAccount {
  private balance: number = 100; // 🔒 Şəxsi! Kənardan heç kəs toxuna bilməz!

  // Pulu artırmaq üçün xüsusi təhlükəsiz metod
  deposit(amount: number) {
    if (amount > 0) {
      this.balance += amount;
    }
  }

  // Pulu görmək üçün metod
  getBalance(): number {
    return this.balance;
  }
}

const account = new BankAccount();
account.deposit(50); // ✅ Təhlükəsiz şəkildə artırdıq (150 oldu)

// account.balance = -500; ❌ XƏTA! TypeScript icazə vermir, çünki balance private-dir!
```

* **Xülasə:** `private` yazdıqda həmin dəyişəni kənar faylların təsadüfən korlamasının qarşısını alırıq.

---

## ❓ 2. Niyə `constructor(private readonly connection: Connection)` Mötərizə Daxilində Yazılır?

TypeScript-də dəyişəni klassa qoşmağın 2 yolu var: **Uzun Yol** və **Qısa Yol**.

### 🐢 Uzun Yol (Ənənəvi JavaScript Yolu):
```typescript
class DatabaseService {
  private connection: Connection; // 1. Yuxarıda elan edirik
  private dbName: string;          // 2. Yuxarıda elan edirik

  constructor(connection: Connection, dbName: string) {
    this.connection = connection; // 3. Mənsub edirik
    this.dbName = dbName;         // 4. Mənsub edirik
  }
}
```
* Görürsən? Eyni sözü 3 dəfə təkrar yazmalı oluruq (`connection`, `this.connection = connection`).

---

### 🚀 Qısa Yol (TypeScript Parameter Property — Bizim Yazdığımız):
TypeScript mühəndisləri düşünürlər ki: *"Əgər proqramçı constructor parametrinin qabağına `private` və ya `readonly` yazırsa, deməli o dəyişəni klassa mənsub etmək istəyir. Gəl yuxarıdakı uzun kodu yazmaq əvəzinə tək sətirdə həll edək!"*

```typescript
class DatabaseService {
  // ✨ Mötərizənin daxilində private/readonly yazdıqda TypeScript arxa fonda
  // avtomatik olaraq yuxarıdakı 4 sətri ÖZÜ YAZIR!
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly dbName: string
  ) {}
}
```

---

## 🎯 3. `readonly` Nə Deməkdir?

* `private`: Dəyişənə yalnız klassın daxilindən toxunmaq olar.
* `readonly`: Dəyişən obyekt yaradılan an 1 dəfə mənsub edilir və **bir daha HEÇ VAXT dəyişdirilə bilməz!** (Yalnız oxuna bilər).

Məsələn, bazaya qoşulma obyekti (`connection`) tətbiq işləyə-işləyə dəyişməməlidir, sabit qalmalıdır. Ona görə `private readonly connection` yazırıq! 🎓
