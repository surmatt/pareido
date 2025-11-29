import { useNavigate } from "react-router-dom"
import { Progress } from "@/components/ui/progress"
import { useLevelSystem } from "@/lib/level-system"
import { useMaterialSystem } from "@/lib/material-system"
import { Trophy } from "lucide-react"
import { MATERIALS } from "@/pages/MaterialsPage"

const formatCount = (count: number) => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  }
  return count;
};

export function GameHUD() {
  const { level, currentXP, nextLevelXP, progress } = useLevelSystem()
  const materials = useMaterialSystem()
  const navigate = useNavigate()

  return (
    <div className="absolute top-4 left-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {/* Level Card */}
      <div 
        className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 pointer-events-auto cursor-pointer hover:bg-black/60 hover:scale-[1.02] shadow-lg"
        onClick={() => navigate("/dashboard")}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="font-bold text-white text-sm">Level {level}</span>
          </div>
          <span className="text-xs text-white/60 font-mono">
            {Math.floor(currentXP)} / {Math.floor(nextLevelXP)} XP
          </span>
        </div>

        <div className="relative">
          <Progress value={progress} className="h-2 bg-white/10" />
        </div>
      </div>

      {/* Materials Row */}
      <div className="flex flex-col items-end justify-end gap-2 pointer-events-auto">
        {MATERIALS.map((material) => {
          const count = materials[material.key] as number;
          const Icon = material.icon;
          
          return (
            <button
              key={material.key}
              onClick={() => navigate("/materials")}
              className="flex flex-col items-center bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-xl hover:bg-white/10 hover:scale-105 group min-w-[3.5rem] shadow-lg"
            >
              <div className={`p-1.5 rounded-lg bg-white/5 ${material.color} mb-1`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold font-mono text-white/90 leading-none">{formatCount(count)}</span>
            </button>
          );
        })}
      </div>
    </div>
  )
}
