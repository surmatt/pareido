import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Hammer, Save, Sparkles } from "lucide-react"

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

export function ResultDialog({
  open,
  onOpenChange,
  result,
  onStabilize,
  onDeconstruct,
}: ResultDialogProps) {
  if (!result) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Signal Detected
          </DialogTitle>
          <DialogDescription>
            A new Resonant entity has been identified.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-2xl font-bold text-center">{result.name}</h3>
            <Badge variant="secondary" className="w-fit">
              Creativity Score: {result.creativityScore}/100
            </Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Raw Materials Detected</h4>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(result.materials).map(([key, value]) => {
                  if (value === 0) return null
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-sm font-medium capitalize text-muted-foreground">{key}</span>
                      <span className="text-xl font-bold">{value}</span>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
          <Button 
            variant="destructive" 
            onClick={onDeconstruct}
            className="w-full sm:w-auto gap-2"
          >
            <Hammer className="h-4 w-4" />
            Deconstruct
          </Button>
          <Button 
            onClick={onStabilize}
            className="w-full sm:w-auto gap-2"
          >
            <Save className="h-4 w-4" />
            Stabilize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

