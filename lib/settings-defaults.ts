import type { SiteSettings } from "@/lib/settings";

export const defaultSettings: SiteSettings = {
  general: {
    name: "Mrs. Yılmaz Visuals",
    tagline: "Anların en zarif hali",
    description:
      "Doğum, yenidoğan ve bebek çekimlerinde samimi ve güven veren bir deneyim sunuyorum. 2016'dan beri fotoğrafçılık yapıyor; 2019'dan itibaren doğum fotoğrafçılığına odaklanıyorum.",
    author: "Melike Yılmaz",
    logoImage: "/images/logo.svg",
    logoIcon: "/images/logo.svg",
    profileImage: "/images/melike-yilmaz.jpg",
    url: "https://www.mrsyilmaz.com",
  },
  contact: {
    location: "Üsküdar, İstanbul",
    mapsUrl: "",
    whatsappPhone: "+90 544 975 83 38",
    workingHours: "Randevu ile — Instagram veya WhatsApp üzerinden ulaşabilirsiniz",
    instagramHandle: "@mrs.yilmaz.visuals",
    instagramUrl: "https://www.instagram.com/mrs.yilmaz.visuals/",
    pageTitle: "Hadi tanışalım",
    pageDescription:
      "Çekim planınız, sorularınız veya randevu talebiniz için formu doldurun ya da Instagram veya WhatsApp üzerinden doğrudan yazın. En kısa sürede dönüş yaparım.",
    formNote:
      "Formu doldurun; mesajınız bana ulaşsın. Daha hızlı iletişim için Instagram veya WhatsApp'tan da yazabilirsiniz.",
  },
  about: {
    pageDescription:
      "Doğum, yenidoğan ve bebek çekimlerinde ailelerin en değerli anlarını samimi, rahat ve güven veren bir ortamda ölümsüzleştiriyorum.",
    aboutImage: "/images/melike-yilmaz.jpg",
    bioParagraphs: [
      "Ben Melike Yılmaz. 2016'dan beri profesyonel fotoğrafçılık yapıyorum; 2019'dan itibaren doğum, yenidoğan ve bebek çekimlerine odaklandım. Her çekimde önce sizinle tanışıyor, süreci birlikte planlıyor ve rahat hissetmenizi sağlıyorum.",
      "Doğum fotoğrafçılığında Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalıyım. Doğum öncesinde ailelerle iletişim kurmayı, herkesin hazır ve huzurlu olmasını önemsiyorum — çünkü en güzel kareler, güvende hissedildiğiniz anlarda doğar.",
      "Samimi, doğal ve poz vermekten çok gerçek duyguları yakalamayı seviyorum. Yıllar içinde birçok ailemle kalıcı dostluklar kurduk. Birlikte, yıllar sonra bile aynı duyguyu hissettirecek kareler yaratacağız.",
    ],
    previewParagraphs: [
      "2016'dan beri fotoğrafçılık yapıyorum; 2019'dan itibaren doğum, yenidoğan ve bebek çekimlerine odaklandım. Çekim öncesinde iletişim kurmayı, samimi ve rahat bir ortam oluşturmayı önemsiyorum.",
      "Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalı doğum fotoğrafçısıyım. Amacım, yıllar sonra baktığınızda o günün duygusunu yeniden hissettirecek kareler bırakmak.",
    ],
    timeline: [
      {
        year: "2016",
        title: "Profesyonel fotoğrafçılık",
        text: "Fotoğrafçılık tutkusunu profesyonel bir kariyere dönüştürdüm.",
      },
      {
        year: "2019",
        title: "Doğum fotoğrafçılığı",
        text: "Doğum ve yenidoğan çekimlerine odaklanarak bu alanda uzmanlaştım.",
      },
      {
        year: "2021",
        title: "Hastane sertifikasyonları",
        text: "Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalı doğum fotoğrafçısı oldum.",
      },
      {
        year: "2024",
        title: "Mrs. Yılmaz Visuals",
        text: "Samimi ve güven veren çekim anlayışıyla yüzlerce aileye eşlik ettim; birçok ailemle kalıcı dostluklar kurduk.",
      },
    ],
    values: [
      {
        title: "Doğallık",
        text: "Her karede yapaylıktan uzak, gerçek duyguları yakalamayı önemsiyorum.",
      },
      {
        title: "Samimiyet",
        text: "Çekim boyunca kendinizi rahat hissetmeniz benim için en önemli öncelik.",
      },
      {
        title: "Zamansızlık",
        text: "Modası geçmeyen, yıllar sonra da aynı değeri taşıyan fotoğraflar üretiyorum.",
      },
      {
        title: "Güven",
        text: "En özel anlarınızı büyük bir özen ve profesyonellikle kayıt altına alıyorum.",
      },
      {
        title: "Kalite",
        text: "Çekimden teslimata kadar her aşamada yüksek kalite standartlarıyla çalışıyorum.",
      },
      {
        title: "Hatıra",
        text: "Fotoğrafların yalnızca bugünü değil, gelecek nesillere aktarılacak anıları da koruduğuna inanıyorum.",
      },
    ],
  },
  home: {
    servicesEyebrow: "Hizmetler",
    servicesTitle: "Her an için özel bir dokunuş",
    servicesDescription:
      "Doğumdan düğüne, yenidoğandan etkinliğe — hikâyenizi anlatan zamansız kareler oluşturuyorum.",
    ctaTitle: "Anılarınızı birlikte ölümsüzleştirelim",
    ctaDescription:
      "Size özel bir çekim planlamak veya müsaitlik durumunu öğrenmek için hemen iletişime geçin.",
  },
};
