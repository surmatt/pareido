import { useMaterialSystem } from "@/lib/material-system"
import { Hammer, Zap, Box, Leaf, Layers, LucideIcon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"

interface MaterialConfig {
  key: keyof ReturnType<typeof useMaterialSystem>;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  details: string;
}

export const MATERIALS: MaterialConfig[] = [
  {
    key: "metal",
    name: "Refined Metal",
    icon: Hammer,
    color: "text-zinc-400",
    description: "Raw metallic compounds.",
    details: "High-grade alloys and base metals salvaged from urban remnants. Essential for structural reinforcement and conductive frameworks. Can be used to reinforce heavy armor cards and upgrade physical damage output."
  },
  {
    key: "synthetic",
    name: "Synth-Plastics",
    icon: Zap,
    color: "text-cyan-400",
    description: "Polymers and artificial compounds.",
    details: "Advanced synthetic materials with high durability and flexibility. Used in everything from casings to insulation. Primary resource for upgrading utility cards and energy efficiency modules."
  },
  {
    key: "stone",
    name: "Composite Stone",
    icon: Box,
    color: "text-stone-400",
    description: "Concrete and mineral aggregates.",
    details: "Dense, heavy construction materials. Provides raw mass and shielding. Extracted from crumbling architecture and pavement. Required for fortifying defensive structure cards and increasing base resistance."
  },
  {
    key: "organic",
    name: "Bio-Matter",
    icon: Leaf,
    color: "text-green-400",
    description: "Plant-based and carbon fibers.",
    details: "Rare organic samples and carbon-based structures. Critical for life-support systems and bio-integration. Essential for upgrading biological synergy cards and adaptive healing abilities."
  },
  {
    key: "fabric",
    name: "Tech-Fiber",
    icon: Layers,
    color: "text-purple-400",
    description: "Woven materials and meshing.",
    details: "Interwoven strands of various resistances. Used for filtration, soft-robotics, and clothing. Crucial for upgrading mobility cards, stealth capabilities, and suit agility."
  }
];

export function MaterialsPage() {
  const navigate = useNavigate()
  const materials = useMaterialSystem()

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
        <h1 className="text-2xl font-bold">Material Stash</h1>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {MATERIALS.map((material) => {
          const count = materials[material.key] as number;
          const Icon = material.icon;

          return (
            <Card key={material.key} className="bg-zinc-900/50 border-zinc-800 p-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 ${material.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-200">{material.name}</h3>
                      <p className="text-sm text-zinc-500">{material.description}</p>
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">
                      {count}
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-2 mt-2">
                    {material.details}
                  </div>
                  <div className="inline-flex items-center px-2 py-1 rounded bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-500 font-mono">
                    UPGRADE RESOURCE
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

