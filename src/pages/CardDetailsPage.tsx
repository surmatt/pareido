import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, Zap, GitMerge, Loader2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { addMaterials } from "@/lib/material-system"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GalleryItem } from "@/common/types"


export function CardDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [item, setItem] = useState<GalleryItem | null>(null)
  const [allItems, setAllItems] = useState<GalleryItem[]>([])

  // Merge state
  const [isMergeOpen, setIsMergeOpen] = useState(false)
  const [isMerging, setIsMerging] = useState(false)

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('gallery_items') || '[]')
    setAllItems(savedItems)
    const found = savedItems.find((i: GalleryItem) => i.id === id)
    setItem(found || null)
  }, [id])

  if (!item) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 text-white items-center justify-center">
        <p className="text-zinc-500">Entity not found.</p>
        <Button onClick={() => navigate("/gallery")} variant="link" className="text-emerald-500 mt-4">
          Return to Gallery
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    const newItems = allItems.filter(i => i.id !== item.id)
    localStorage.setItem('gallery_items', JSON.stringify(newItems))
    navigate("/gallery")
  }

  const handleDestruct = () => {
    // Add materials
    addMaterials(item.analysis.materials)
    // Delete item
    handleDelete()
  }

  const handleMerge = async (otherItem: GalleryItem) => {
    setIsMerging(true)
    try {
      const response = await fetch('/api/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card1: item,
          card2: otherItem
        })
      });

      if (!response.ok) throw new Error('Merge failed');

      const mergedCard: GalleryItem = await response.json();

      // Remove the two original cards and add the merged one
      const updatedItems = allItems
        .filter(i => i.id !== item.id && i.id !== otherItem.id)
        .concat(mergedCard);
      localStorage.setItem('gallery_items', JSON.stringify(updatedItems));

      setIsMergeOpen(false);
      navigate(`/gallery/${mergedCard.id}`); // Go to new merged card

    } catch (error) {
      console.error(error);
      alert('Failed to merge entities');
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-zinc-800 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/gallery")}
          className="text-white hover:bg-white/10 mr-4"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold truncate">{item.analysis.name}</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Image Card */}
        <div className="aspect-[4/5] w-full relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
          {(item.image || item.originalImage) && (
            <img
              src={item.image || item.originalImage}
              alt={item.analysis.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Materials */}
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Materials Composition</h2>
          <div className="space-y-3">
            {Object.entries(item.analysis.materials).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize text-zinc-300">{key}</span>
                <div className="flex items-center gap-3 w-1/2">
                  <div className="h-2 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/80"
                      style={{ width: `${(value / 20) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono text-zinc-400">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 pb-12">
          <Button
            variant="outline"
            className="border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 h-14"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-5 w-5" />
            Delete
          </Button>

          <Button
            variant="default"
            className="bg-amber-600 hover:bg-amber-700 text-white border-amber-500/50 h-14"
            onClick={handleDestruct}
          >
            <Zap className="mr-2 h-5 w-5" />
            Destruct
          </Button>

          <Button
            variant="default"
            className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500/50 h-14"
            onClick={() => setIsMergeOpen(true)}
          >
            <GitMerge className="mr-2 h-5 w-5" />
            Merge Entity
          </Button>
        </div>
      </div>

      {/* Merge Dialog */}
      <Dialog open={isMergeOpen} onOpenChange={setIsMergeOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[90%] rounded-2xl max-h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 border-b border-zinc-800">
            <DialogTitle>Select Entity to Merge With</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-3">
              {allItems
                .filter(i => i.id !== item.id)
                .map((other) => (
                  <button
                    key={other.id}
                    disabled={isMerging}
                    onClick={() => handleMerge(other)}
                    className="relative group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-emerald-500/50 transition-colors text-left"
                  >
                    <div className="aspect-square bg-zinc-800 relative">
                      {(other.image || other.originalImage) && (
                        <img
                          src={other.image || other.originalImage}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="font-bold text-xs truncate">{other.analysis.name}</p>
                      <p className="text-[10px] text-zinc-500">Score: {other.analysis.creativityScore}</p>
                    </div>
                    {isMerging && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-emerald-500" />
                      </div>
                    )}
                  </button>
                ))}

              {allItems.length <= 1 && (
                <div className="col-span-2 text-center py-8 text-zinc-500 text-sm">
                  No other entities available to merge.
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

