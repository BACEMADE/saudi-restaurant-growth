import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8 animate-fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.12] text-foreground">
              Connecting Saudi Restaurants With Local Food Creators —{" "}
              <span className="text-primary italic">Every Month.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              We match your restaurant with vetted Saudi food creators who visit,
              create authentic content, and keep your brand visible across social
              media — consistently.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="rounded-full px-10 text-base gap-2 group">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a href="#how-it-works">
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full px-10 text-base text-foreground hover:bg-muted"
                >
                  How It Works
                </Button>
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              Trusted by <span className="font-semibold text-foreground">200+ restaurants</span> across Saudi Arabia
            </p>
          </div>

          {/* Right: Image */}
          <div className="relative animate-fade-in hidden lg:block">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-border">
              <img
                src={heroImage}
                alt="Saudi food creator capturing restaurant content"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-5 shadow-xl">
              <p className="text-3xl font-serif text-primary">3.2x</p>
              <p className="text-sm text-muted-foreground font-medium">Average ROI for partners</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
