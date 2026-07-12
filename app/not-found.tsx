import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-serif text-6xl text-gold">404</p>
      <h1 className="mt-4 text-3xl text-espresso">Sayfa bulunamadı</h1>
      <p className="mt-3 max-w-md text-mocha">
        Aradığınız sayfa taşınmış veya hiç var olmamış olabilir. Ana sayfaya
        dönerek devam edebilirsiniz.
      </p>
      <Button href="/" size="lg" className="mt-8">
        Ana Sayfaya Dön
      </Button>
    </section>
  );
}
