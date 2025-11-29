interface MaterialCounts {
    metal: number
    synthetic: number
    stone: number
    organic: number
    fabric: number
    [key: string]: number
}

interface AnalysisResult {
    name: string
    creativityScore: number
    materials: MaterialCounts
}

interface GalleryItem {
    id: string
    timestamp: number
    image: string
    originalImage?: string
    analysis: AnalysisResult
}

export type { MaterialCounts, AnalysisResult, GalleryItem };