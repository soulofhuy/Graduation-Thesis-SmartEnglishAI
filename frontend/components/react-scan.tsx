'use client'

import { useEffect } from 'react'

export function ReactScan() {
    useEffect(() => {
        import('react-scan').then(({ scan }) => {
            scan({ enabled: true })
        })
    }, [])

    return null
}