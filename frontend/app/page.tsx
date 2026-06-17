'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/language-provider'
import { ArrowRight, Sparkles, BookOpen, BarChart3, Globe, Users, Zap } from 'lucide-react'

export default function LandingPage() {
  const { t } = useLanguage()
  const [scrollY, setScrollY] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const [heroCarouselApi, setHeroCarouselApi] = useState<CarouselApi | null>(null)
  const [heroSelectedIndex, setHeroSelectedIndex] = useState(0)
  const [heroSnapCount, setHeroSnapCount] = useState(0)

  const heroSlides = [
    { src: '/landing-page/scrolling-pictures/pic-1.png', alt: 'English fun fact 1' },
    { src: '/landing-page/scrolling-pictures/pic-2.png', alt: 'English fun fact 2' },
    { src: '/landing-page/scrolling-pictures/pic-3.png', alt: 'English fun fact 3' },
    { src: '/landing-page/scrolling-pictures/pic-4.png', alt: 'English fun fact 4' },
    { src: '/landing-page/scrolling-pictures/pic-5.png', alt: 'English fun fact 5' },
    { src: '/landing-page/scrolling-pictures/pic-6.png', alt: 'English fun fact 6' },
    { src: '/landing-page/scrolling-pictures/pic-7.png', alt: 'English fun fact 7' },
  ]

  useEffect(() => {
    setIsLoaded(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!heroCarouselApi) return

    const update = () => {
      setHeroSelectedIndex(heroCarouselApi.selectedScrollSnap())
      setHeroSnapCount(heroCarouselApi.scrollSnapList().length)
    }

    update()
    heroCarouselApi.on('reInit', update)
    heroCarouselApi.on('select', update)

    return () => {
      heroCarouselApi.off('reInit', update)
      heroCarouselApi.off('select', update)
    }
  }, [heroCarouselApi])

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll(
        '.scroll-fade-in, .scroll-fade-in-delay-1, .scroll-fade-in-delay-2, .scroll-fade-in-delay-3'
      )
    )

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
      }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])


  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 10 ? 'bg-card/90 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Image
            src="/logo/langoer-logo.png"
            alt="Langoer Logo"
            width={150}
            height={150}
          />
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="transition-all duration-200 hover:bg-primary/20 hover:text-primary">
                {t.nav.login}
              </Button>
            </Link>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900" />

        {/* Animated background elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div className={`space-y-8 transition-all duration-1000 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                {t.landing.hero.title}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              {t.landing.hero.subtitle}
            </p>
            {/* <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="transition-smooth">
                <Button size="lg" className="gap-2 w-full sm:w-auto shadow-glow hover:shadow-glow hover:scale-105 transition-all">
                  {t.landing.hero.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto transition-smooth hover:bg-primary/5">
                {t.landing.hero.learn}
              </Button>
            </div> */}
            {/* <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">10K+ học sinh</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-foreground font-medium">AI hỗ trợ 24/7</span>
              </div>
            </div> */}
          </div>

          {/* Right side - Image */}
          <div className={`relative h-96 md:h-[28rem] lg:h-[34rem] transition-all duration-1000 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-2xl" />

            <div className="pointer-events-none absolute top-13 -left-20 z-20 hidden md:block">
              <Image
                src="/landing-page/scrolling-pictures/decorative-element.png"
                alt="Overlay hint"
                width={150}
                height={100}
                style={{ rotate: '-20deg' }}
              />
            </div>

            <Carousel
              setApi={(api) => setHeroCarouselApi(api)}
              opts={{
                loop: true,
                align: 'center',
                duration: 800
              }}
              className="relative z-10"
            >
              <CarouselContent>
                {heroSlides.map((slide) => (
                  <CarouselItem key={slide.src} className="will-change-transform">
                    <div className="relative h-96 md:h-[28rem] lg:h-[34rem] overflow-hidden ">
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        className="object-contain"
                        priority
                        quality={85}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Arrow controls */}
              <CarouselPrevious
                variant="outline"
                className="left-4 -translate-y-1/2 top-1/2 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50"
              />
              <CarouselNext
                variant="outline"
                className="right-4 -translate-y-1/2 top-1/2 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50"
              />

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {Array.from({ length: heroSnapCount }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === heroSelectedIndex}
                    onClick={() => heroCarouselApi?.scrollTo(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${index === heroSelectedIndex
                      ? 'bg-primary scale-110'
                      : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                      }`}
                  />
                ))}
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-purple-50/60 to-pink-50/70 dark:from-slate-900/80 dark:via-purple-950/60 dark:to-slate-900/80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute -top-16 right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              {t.landing.features.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.landing.features.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group scroll-fade-in-delay-1">
              <Card className="p-8 h-full hover:shadow-glow transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary/40 group-hover:to-primary/20 transition-all">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {t.landing.features.feature1.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.landing.features.feature1.desc}
                </p>
              </Card>
            </div>

            {/* Feature 2 */}
            <div className="group scroll-fade-in-delay-2">
              <Card className="p-8 h-full hover:shadow-glow-accent transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-accent/40 group-hover:to-accent/20 transition-all">
                  <BookOpen className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {t.landing.features.feature2.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.landing.features.feature2.desc}
                </p>
              </Card>
            </div>

            {/* Feature 3 */}
            <div className="group scroll-fade-in-delay-3">
              <Card className="p-8 h-full hover:shadow-glow transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-secondary/40 group-hover:to-secondary/20 transition-all">
                  <BarChart3 className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {t.landing.features.feature3.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.landing.features.feature3.desc}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section 1 */}
      <section className="relative py-24 overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-orange-50/60 to-rose-50/70 dark:from-slate-900/80 dark:via-amber-950/40 dark:to-slate-900/80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute -top-10 left-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 right-6 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 items-center">
            <div className="relative h-96">
              <Image
                src="/landing-page/logo-and-AI.png"
                alt="AI Feature"
                fill
                className="object-contain object-center"
              />
            </div>
            <div className="space-y-6 scroll-fade-in">
              <h2 className="text-4xl font-bold text-foreground">
                <span className="gradient-text leading-tight">{t.landing.ai.title}</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.landing.ai.description}
              </p>
              <ul className="space-y-3 pl-5">
                {t.landing.ai.features.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section 2 */}
      <section className="relative py-24 overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/70 via-cyan-50/60 to-teal-50/70 dark:from-slate-900/80 dark:via-emerald-950/40 dark:to-slate-900/80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute -top-14 right-12 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-24 left-6 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 scroll-fade-in order-2 md:order-1">
              <h2 className="text-4xl font-bold text-foreground">
                <span className="gradient-text leading-tight">{t.landing.student_benefits.title}</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.landing.student_benefits.description}
              </p>
              <ul className="space-y-3 pl-5">
                {t.landing.student_benefits.features.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-96 order-1 md:order-2">
              <Image
                src="/landing-page/student-benefits.png"
                alt="Practice Feature"
                fill
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Image Section 3 */}
      <section className="relative py-24 overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-sky-50/60 to-violet-50/70 dark:from-slate-900/80 dark:via-indigo-950/40 dark:to-slate-900/80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute -top-12 left-12 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-24 right-8 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96">
              <Image
                src="/landing-page/statistic.png"
                alt="Analytics Feature"
                fill
                className="object-cover rounded-2xl shadow-glow"
              />
            </div>
            <div className="space-y-6 scroll-fade-in">
              <h2 className="text-4xl font-bold text-foreground">
                <span className="gradient-text leading-tight">{t.landing.statistic.title}</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.landing.statistic.description}
              </p>
              <ul className="space-y-3 pl-5">
                {t.landing.statistic.features.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/70 via-rose-50/60 to-orange-50/70 dark:from-slate-900/80 dark:via-fuchsia-950/40 dark:to-slate-900/80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute -top-10 right-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            <span className="gradient-text">{t.landing.outro.title}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.landing.outro.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="gap-2 shadow-glow hover:shadow-glow hover:scale-105 transition-all">
                {t.landing.outro.button[0]}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Image
              src="/logo/langoer-logo.png"
              alt="Langoer Logo"
              width={150}
              height={150}
            />
            <p className="text-sm text-muted-foreground text-center md:text-right">
              {t.landing.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
