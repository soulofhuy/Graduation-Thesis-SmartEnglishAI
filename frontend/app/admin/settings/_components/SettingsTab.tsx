"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/language-provider'

export function SettingsTab() {
    const { t } = useLanguage()
    return (
        <TabsContent value="setting" className="space-y-6">
            <Card>
                <CardHeader className="mb-3">
                    <CardTitle>{t.student.settings.tabs.settingsTab.subTitle}</CardTitle>
                    <CardDescription>{t.student.settings.tabs.settingsTab.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-1">
                            <p className="text-base font-medium">{t.student.settings.tabs.settingsTab.option[0].title}</p>
                            <p className="text-sm text-muted-foreground">
                                {t.student.settings.tabs.settingsTab.option[0].description}
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-1">
                            <p className="text-base font-medium">{t.student.settings.tabs.settingsTab.option[1].title}</p>
                            <p className="text-sm text-muted-foreground">
                                {t.student.settings.tabs.settingsTab.option[1].description}
                            </p>
                        </div>
                        <LanguageToggle />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    )
}