import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Camera, Check, X, Upload, AlertCircle, Loader2 } from 'lucide-react'
import { apiService } from '@/services/api'
import { useNavigate } from 'react-router-dom'

export function FaceRegistrationPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // State management
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'init' | 'capturing' | 'preview' | 'success'>('init')

  // Camera positions guide
  const photoGuides = [
    { id: 1, label: 'Wajah Depan', description: 'Lihat langsung ke kamera' },
    { id: 2, label: 'Sedikit Kanan', description: 'Putar kepala sedikit ke kanan' },
    { id: 3, label: 'Sedikit Kiri', description: 'Putar kepala sedikit ke kiri' },
    { id: 4, label: 'Sedikit Atas', description: 'Angkat dagu sedikit ke atas' },
    { id: 5, label: 'Sedikit Bawah', description: 'Turunkan dagu sedikit ke bawah' },
  ]

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
      
      setCurrentStep('capturing')
      toast.success('Kamera berhasil diaktifkan!')
    } catch (error) {
      console.error('Error accessing camera:', error)
      setCameraError('Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera.')
      toast.error('Gagal mengakses kamera')
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || capturedPhotos.length >= 5) {
      return
    }

    setIsCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) {
      toast.error('Gagal mengambil foto')
      setIsCapturing(false)
      return
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const photoUrl = URL.createObjectURL(blob)
        setCapturedPhotos(prev => [...prev, photoUrl])
        toast.success(`Foto ${capturedPhotos.length + 1} berhasil diambil!`)
      }
      setIsCapturing(false)
    }, 'image/jpeg', 0.9)
  }

  // Delete a captured photo
  const deletePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index))
    toast.info('Foto dihapus')
  }

  // Convert dataURL to File
  const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], filename, { type: 'image/jpeg' })
  }

  // Submit photos to API
  const handleSubmit = async () => {
    if (capturedPhotos.length !== 5) {
      toast.error('Harap ambil 5 foto terlebih dahulu')
      return
    }

    setIsSubmitting(true)

    try {
      // Convert all photos to File objects
      const files = await Promise.all(
        capturedPhotos.map((photoUrl, index) =>
          dataURLtoFile(photoUrl, `foto_${index + 1}.jpg`)
        )
      )

      // Call API
      const response = await apiService.registerFace(files)
      
      toast.success(response.message || 'Wajah berhasil didaftarkan!')
      setCurrentStep('success')
      
      // Stop camera
      stopCamera()
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
      
    } catch (error: any) {
      console.error('Error submitting photos:', error)
      const errorMessage = error.response?.data?.detail || 'Gagal mendaftarkan wajah'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
      // Cleanup blob URLs
      capturedPhotos.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  // Success view
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Pendaftaran Wajah Berhasil!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Wajah Anda telah berhasil didaftarkan. Anda sekarang dapat melakukan absensi dengan pengenalan wajah.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengarahkan ke dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pendaftaran Wajah
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Daftarkan wajah Anda untuk sistem absensi. Ambil 5 foto wajah dari berbagai sudut untuk hasil terbaik.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Instructions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tips Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Tips Pengambilan Foto
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Pastikan wajah terlihat jelas dan tidak tertutup</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Gunakan pencahayaan yang cukup</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Lepas kacamata atau masker jika memungkinkan</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Ekspresi wajah natural dan netral</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Hindari gerakan saat mengambil foto</span>
                </li>
              </ul>
            </div>

            {/* Photo Guide */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Panduan Posisi Foto
              </h3>
              <div className="space-y-3">
                {photoGuides.map((guide, index) => (
                  <div
                    key={guide.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      capturedPhotos.length === index
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                        : capturedPhotos.length > index
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        capturedPhotos.length > index
                          ? 'bg-green-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {capturedPhotos.length > index ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{guide.id}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{guide.label}</p>
                      <p className="text-xs opacity-90">{guide.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Camera & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera View */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentStep === 'init' ? 'Mulai Kamera' : 'Kamera Aktif'}
                </h3>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Foto: {capturedPhotos.length}/5
                </div>
              </div>

              {/* Camera Error */}
              {cameraError && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">{cameraError}</p>
                </div>
              )}

              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                {currentStep === 'init' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Camera className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Klik tombol di bawah untuk memulai kamera</p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Current Guide Overlay */}
                    {capturedPhotos.length < 5 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-medium">
                          {photoGuides[capturedPhotos.length].label}
                        </p>
                        <p className="text-xs opacity-90">
                          {photoGuides[capturedPhotos.length].description}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Controls */}
              <div className="flex gap-3">
                {currentStep === 'init' ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    data-testid="start-camera-btn"
                  >
                    <Camera className="w-5 h-5" />
                    Aktifkan Kamera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={capturePhoto}
                      disabled={isCapturing || capturedPhotos.length >= 5}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      data-testid="capture-photo-btn"
                    >
                      {isCapturing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Mengambil Foto...
                        </>
                      ) : capturedPhotos.length >= 5 ? (
                        <>
                          <Check className="w-5 h-5" />
                          Semua Foto Lengkap
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          Ambil Foto ({capturedPhotos.length + 1}/5)
                        </>
                      )}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                      data-testid="stop-camera-btn"
                    >
                      Hentikan
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Photo Preview Grid */}
            {capturedPhotos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preview Foto
                </h3>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {capturedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        onClick={() => deletePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                        data-testid={`delete-photo-${index}-btn`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/75 text-white text-xs px-2 py-0.5 rounded">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: 5 - capturedPhotos.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                    >
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={capturedPhotos.length !== 5 || isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="submit-photos-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Mengirim Data...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Daftarkan Wajah
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
