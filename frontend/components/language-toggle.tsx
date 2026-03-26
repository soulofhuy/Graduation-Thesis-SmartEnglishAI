'use client'

import Image from 'next/image'
import { useLanguage } from './language-provider'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-1 bg-muted rounded-xl p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('vi')}
        className={`rounded-lg transition-all ${language === 'vi'
          ? 'bg-gradient-to-br from-primary to-accent text-white shadow-glow'
          : 'text-foreground hover:bg-[var(--control-hover-bg)] active:bg-[var(--control-active-bg)]'
          }`}
        title="Tiếng Việt"
      >
        <Image
          src="/language-photos/vn.png"
          alt="Vietnamese Flag"
          width={20}
          height={20}
        />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('en')}
        className={`rounded-lg transition-all ${language === 'en'
          ? 'bg-gradient-to-br from-primary to-accent text-white shadow-glow'
          : 'text-foreground hover:bg-[var(--control-hover-bg)] active:bg-[var(--control-active-bg)]'
          }`}
        title="English"
      >
        <Image
          src="/language-photos/en.png"
          alt="English Flag"
          width={20}
          height={20}
        />
      </Button>
    </div>
  )
}
