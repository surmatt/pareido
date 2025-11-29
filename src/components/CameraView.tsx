import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, Loader2 } from "lucide-react"
import { ResultDialog } from "./ResultDialog"
import { GameHUD } from "./GameHUD"
import { useLevelSystem } from "@/lib/level-system"
import { useMaterialSystem } from "@/lib/material-system"

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

export function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const { gainXP } = useLevelSystem()
  const { gainMaterials } = useMaterialSystem()

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" },
          audio: false 
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
      }
    }

    setupCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!videoRef.current) return

    if (!analyzing && !showModal) {
      videoRef.current.play().catch(() => {})
      setCapturedImage(null)
    }
  }, [analyzing, showModal])

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setResult(data)
      setShowModal(true)
      gainXP(data.creativityScore) // Award random XP between 50-70 for scanning
    } catch (error) {
      console.error("Error analyzing image:", error)
      alert("Failed to analyze image. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCapture = () => {
    if (!videoRef.current) return
    videoRef.current.pause()

    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL("image/jpeg", 0.8)
      analyzeImage(imageData)
    }
  }

  const handleGalleryClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setCapturedImage(imageData)
        analyzeImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStabilize = () => {
    console.log("Stabilizing character:", result)
    setShowModal(false)
    // TODO: Implement save logic
  }

  const handleDeconstruct = () => {
    console.log("Deconstructing for materials:", result?.materials)
    if (result?.materials) {
      gainMaterials({
        metal: result.materials.metal,
        synthetic: result.materials.synthetic,
        stone: result.materials.stone,
        organic: result.materials.organic,
        fabric: result.materials.fabric
      })
    }
    setShowModal(false)
  }

  return (
    <>
      <GameHUD />
      {/* Camera View */}
      <div className="flex-1 overflow-hidden relative bg-black">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        
        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {analyzing && (
        <div className="absolute inset-0 z-[60] bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Scanning Resonant Signal...</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Gallery Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
            onClick={handleGalleryClick}
            disabled={analyzing}
          >
            <ImagePlus className="h-6 w-6" />
          </Button>

          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* Capture Button */}
          <Button 
            className="h-20 w-20 rounded-full border-4 border-white bg-transparent hover:bg-white/20 p-1"
            onClick={handleCapture}
            disabled={analyzing}
          >
            <div className="h-full w-full rounded-full bg-white" />
          </Button>

          {/* Spacer for symmetry */}
          <div className="w-12" />
        </div>
      </div>

      <ResultDialog 
        open={showModal} 
        onOpenChange={setShowModal}
        result={result}
        onStabilize={handleStabilize}
        onDeconstruct={handleDeconstruct}
      />
    </>
  )
}

