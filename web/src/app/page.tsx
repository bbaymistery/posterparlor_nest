import { HeroSection, FeaturedPosters } from "@/features/home/components";

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-7xl">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Posters Showcase */}
      <FeaturedPosters />
    </div>
  );
}
