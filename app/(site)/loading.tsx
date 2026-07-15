import { CameraMemoriesLoader } from "@/components/ui/CameraMemoriesLoader";

export default function SiteLoading() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center px-6 py-16">
      <CameraMemoriesLoader message="Anılar hazırlanıyor…" />
    </div>
  );
}
