import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

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

export function GalleryPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<GalleryItem[]>([])

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('gallery_items') || '[]')
    setItems(savedItems)
  }, [])

  const handleDelete = (id: string) => {
    const newItems = items.filter(item => item.id !== id)
    setItems(newItems)
    localStorage.setItem('gallery_items', JSON.stringify(newItems))
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-zinc-800">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/10 mr-4"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Save className="text-emerald-500" />
          Stabilized Entities
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 pb-20">
          {items.length === 0 ? (
            <div className="col-span-2 text-center text-zinc-500 py-12">
              <p>No stabilized entities yet.</p>
              <p className="text-sm mt-2">Scan and stabilize entities to see them here.</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 flex flex-col cursor-pointer transition-colors hover:border-zinc-700"
                onClick={() => navigate(`/gallery/${item.id}`)}
              >
                <div className="aspect-[4/5] relative bg-zinc-900">
                  {/* We prefer originalImage if available, otherwise fallback to the saved image (which might be empty) */}
                  {(item.image || item.originalImage) && (
                    <img 
                      src={item.image || item.originalImage} 
                      alt={item.analysis.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm mb-1 truncate">{item.analysis.name}</h3>
                  <div className="text-xs text-zinc-500 mb-3">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

