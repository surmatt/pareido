import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus } from "lucide-react"

export function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

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

  const handleCapture = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL("image/png")
      console.log("Captured image:", imageData)
      // TODO: Handle captured image
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
        console.log("Imported image:", imageData)
        // TODO: Handle imported image
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      {/* Camera View */}
      <div className="flex-1 overflow-hidden relative">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Gallery Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
            onClick={handleGalleryClick}
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
          >
            <div className="h-full w-full rounded-full bg-white" />
          </Button>

          {/* Spacer for symmetry or potential flip camera button */}
          <div className="w-12" />
        </div>
      </div>
    </>
  )
}

