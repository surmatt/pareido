import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLevelSystem } from "@/lib/level-system"
import { ArrowLeft, Trophy } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface LeaderboardUser {
  rank: number;
  name: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

const MOCK_USERS: LeaderboardUser[] = [
  { rank: 1, name: "NeonHunter", level: 42, xp: 156000 },
  { rank: 2, name: "PixelSeeker", level: 38, xp: 124000 },
  { rank: 3, name: "VoidWalker", level: 35, xp: 98000 },
  { rank: 4, name: "GlitchMaster", level: 31, xp: 82000 },
  { rank: 5, name: "CyberScout", level: 28, xp: 65000 },
  { rank: 6, name: "DataMiner", level: 25, xp: 51000 },
  { rank: 7, name: "SignalBreaker", level: 22, xp: 42000 },
  { rank: 8, name: "EchoFinder", level: 19, xp: 33000 },
  { rank: 9, name: "WaveRider", level: 15, xp: 21000 },
  { rank: 10, name: "NetRunner", level: 12, xp: 15000 },
];

export function Dashboard() {
  const navigate = useNavigate()
  const { level, currentXP, totalXP, nextLevelXP } = useLevelSystem()

  const currentUser: LeaderboardUser = {
    rank: 999,
    name: "YOU",
    level: level,
    xp: totalXP, // Use totalXP for the leaderboard comparison
    isCurrentUser: true
  };

  const allUsers = [...MOCK_USERS, currentUser].sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return b.xp - a.xp;
  });

  allUsers.forEach((user, index) => {
    user.rank = index + 1;
  });

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
          <Trophy className="text-yellow-500" />
          Neural Dashboard
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Stats Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-400">Personal Resonance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <div className="text-sm text-zinc-500 mb-1">Current Level</div>
              <div className="text-3xl font-bold font-mono">{level}</div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <div className="text-sm text-zinc-500 mb-1">Total XP</div>
              <div className="text-3xl font-bold font-mono text-primary">
                {Math.floor(totalXP).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-500">Progress to Level {level + 1}</span>
              <span className="font-mono text-zinc-300">
                {Math.floor(currentXP)} / {Math.floor(nextLevelXP)} XP
              </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${(currentXP / nextLevelXP) * 100}%` }}
              />
            </div>
          </div>
        </section>

        <Separator className="bg-zinc-800" />

        {/* Leaderboard Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-400">Global Rankings</h2>
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
              Your Rank: #{currentUser.rank}
            </Badge>
          </div>

          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableHead className="w-[60px] text-zinc-400">#</TableHead>
                  <TableHead className="text-zinc-400">Entity</TableHead>
                  <TableHead className="text-right text-zinc-400">Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow 
                    key={user.name}
                    className={`border-zinc-800 ${
                      user.isCurrentUser 
                        ? "bg-primary/10 hover:bg-primary/20" 
                        : "hover:bg-white/5"
                    }`}
                  >
                    <TableCell className={`font-mono font-bold ${
                      user.rank <= 3 ? "text-yellow-500" : "text-zinc-500"
                    }`}>
                      {user.rank}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`font-medium ${user.isCurrentUser ? "text-white" : "text-zinc-300"}`}>
                          {user.name}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {user.xp.toLocaleString()} XP
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-zinc-300">
                      {user.level}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  )
}

