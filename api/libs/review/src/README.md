# 🗺️ Review Kitabxanası — Master Oxuma Xəritəsi

Salam əziz tələbəm! 👨‍🏫 `libs/review` modulunda layihənin rəy (review), qiymətləndirmə (rating) və ulduz statistikaları idarə olunur. Bu modulu addım-addım anlamaq üçün aşağıdakı sırayla sənədləri oxumağın məsləhətdir:

---

## 📖 Oxuma Sırası (Recommended Reading Sequence)

1. **[`reviewmodule.md`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/review/src/lib/reviewmodule.md)**: Modulun NestJS daxilində necə konfiqurasiya olunduğunu və dependencies-lərin daxil edilməsini öyrən.
2. **[`reviewservice.md`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/review/src/lib/reviewservice.md)**: Cloudinary şəkil yükləməsi, təkrar rəy yoxlaması, ulduz statistikası və MongoDB rollback biznes loqikasını öyrən.
3. **[`review.controller.md`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/review/src/lib/review.controller.md)**: POST, PUT, GET, DELETE HTTP endpoint-lərini, Interceptor və Guard təhlükəsizlik tətbiqlərini öyrən.
4. **[`TestingWithPostman.md`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/review/TestingWithPostman.md)**: Review API-lərini Postman-da addım-addım test etmək bələdçisi.

---

## 🎯 Kitabxananın Əsas Vəzifələri:
* 🌟 **Rəy & Ulduz Qiymətləndirməsi**: İstifadəçilərin istənilən posterə 1-5 ulduz balı və rəy mətni yazması.
* 🚫 **Biri 1 Rəy Qaydası**: İstifadəçinin eyni posterə təkrar rəy yazmasının qarşısının alınması.
* 📸 **Bulud Şəkil Yükləməsi**: Cloudinary servisi vasitəsilə rəyə 5-dək şəkil əlavə edilməsi.
* 🔄 **Təhlükəsiz Rollback**: Baza əməliyyatında xəta olduqda şəkillərin avtomatik buluddan silinməsi.
* 📊 **Mongoose Aggregation**: Posterin orta reytinqi və 1-5 ulduz verilən rəylərin paylanma statistikası.
