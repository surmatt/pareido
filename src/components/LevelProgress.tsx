import { useNavigate } from "react-router-dom"
import { Progress } from "@/components/ui/progress"
import { useLevelSystem } from "@/lib/level-system"
import { Trophy } from "lucide-react"

export function LevelProgress() {
  const { level, currentXP, nextLevelXP, progress } = useLevelSystem()
  const navigate = useNavigate()

  return (
    <div 
      className="absolute top-4 left-4 right-4 z-50 cursor-pointer group"
      onClick={() => navigate("/dashboard")}
    >
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 transition-all duration-300 hover:bg-black/60 hover:scale-[1.02]">
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
    </div>
  )
}

