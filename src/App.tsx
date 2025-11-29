import { CameraView } from "@/components/CameraView"
import { Routes, Route } from "react-router-dom"
import { Dashboard } from "@/pages/Dashboard"

function App() {
  return (
    <div className="min-h-svh w-full bg-zinc-950 flex items-center justify-center md:p-8">
      <div className="relative flex h-svh w-full flex-col bg-black text-white md:h-[850px] md:max-h-[90vh] md:w-full md:max-w-md md:rounded-[2.5rem] md:border-[8px] md:border-zinc-800 md:shadow-2xl overflow-hidden ring-1 ring-white/10">
        <Routes>
          <Route path="/" element={<CameraView />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  )
}

export default App