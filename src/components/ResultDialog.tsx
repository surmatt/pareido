import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Hammer, Save, Zap, Box, Leaf, Layers, LucideIcon } from "lucide-react"

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

interface ResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: AnalysisResult | null
  onStabilize: () => void
  onDeconstruct: () => void
}

const MATERIAL_CONFIG: Record<string, { icon: LucideIcon, color: string }> = {
  metal: { icon: Hammer, color: "text-zinc-400" },
  synthetic: { icon: Zap, color: "text-cyan-400" },
  stone: { icon: Box, color: "text-stone-400" },
  organic: { icon: Leaf, color: "text-green-400" },
  fabric: { icon: Layers, color: "text-purple-400" },
}

export function ResultDialog({
  open,
  onOpenChange,
  result,
  onStabilize,
  onDeconstruct,
}: ResultDialogProps) {
  if (!result) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onDeconstruct()
      }
      onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            {result.name}
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            A new Resonant entity has been identified.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center p-4 rounded-full bg-zinc-900 border-2 border-zinc-800 w-24 h-24 shadow-lg shadow-black/50">
               <span className="text-3xl font-bold font-mono">{result.creativityScore}</span>
               <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Score</span>
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <h4 className="font-medium text-xs text-zinc-500 text-center mb-4 uppercase tracking-wider">Raw Materials Detected</h4>
            <div className="flex flex-wrap justify-center">
              {Object.entries(result.materials).map(([key, value]) => {
                if (value === 0) return null
                const config = MATERIAL_CONFIG[key]
                if (!config) return null
                const Icon = config.icon
                
                return (
                  <div key={key} className="flex flex-col items-center gap-2 min-w-[60px]">
                    <div className={`p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 ${config.color} shadow-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold font-mono text-zinc-200">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
          <Button 
            variant="destructive" 
            onClick={onDeconstruct}
            className="w-full sm:flex-1 gap-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 border-red-900/50"
          >
            <Hammer className="h-4 w-4" />
            Deconstruct
          </Button>
          <Button 
            onClick={onStabilize}
            className="w-full sm:flex-1 gap-2 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 border-emerald-900/50 hover:text-emerald-300"
            variant="outline"
          >
            <Save className="h-4 w-4" />
            Stabilize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

