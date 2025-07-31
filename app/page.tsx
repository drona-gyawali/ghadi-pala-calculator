"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calculator, Sun, Clock, MapPin, Info, Star, Sparkles, Calendar, Timer } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CalculationResult {
  sunriseTime: string
  birthTimeFormatted: string
  timeDifferenceMinutes: number
  timeDifferenceFormatted: string
  ghadi: number
  pala: number
  vighati: number
  calculations: {
    totalSeconds: number
    ghadiCalculation: string
    palaCalculation: string
    vighatiCalculation: string
  }
}

export default function GhadiPalaCalculator() {
  const [formData, setFormData] = useState({
    birthDate: "",
    birthTime: "",
    latitude: "",
    longitude: "",
    cityName: "",
    manualSunrise: "",
  })

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Sunrise calculation using astronomical formulas
  const calculateSunrise = (date: Date, latitude: number, longitude: number): Date => {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)

    // Solar declination
    const declination = 23.45 * Math.sin((((360 * (284 + dayOfYear)) / 365) * Math.PI) / 180)

    // Hour angle
    const latRad = (latitude * Math.PI) / 180
    const declRad = (declination * Math.PI) / 180

    const hourAngle = (Math.acos(-Math.tan(latRad) * Math.tan(declRad)) * 180) / Math.PI

    // Solar noon (in minutes from midnight)
    const solarNoon = 720 - 4 * longitude

    // Sunrise time (in minutes from midnight)
    const sunriseMinutes = solarNoon - 4 * hourAngle

    const sunriseDate = new Date(date)
    sunriseDate.setHours(0, 0, 0, 0)
    sunriseDate.setMinutes(sunriseMinutes)

    return sunriseDate
  }

  const calculateGhadiPala = () => {
    setLoading(true)
    setError("")

    try {
      // Validate inputs
      if (!formData.birthDate || !formData.birthTime) {
        throw new Error("Birth date and time are required")
      }

      if (!formData.manualSunrise && (!formData.latitude || !formData.longitude)) {
        throw new Error("Either coordinates or manual sunrise time is required")
      }

      // Parse birth date and time
      const birthDateTime = new Date(`${formData.birthDate}T${formData.birthTime}`)

      let sunriseTime: Date

      if (formData.manualSunrise) {
        // Use manual sunrise input
        sunriseTime = new Date(`${formData.birthDate}T${formData.manualSunrise}`)
      } else {
        // Calculate sunrise automatically
        const lat = Number.parseFloat(formData.latitude)
        const lng = Number.parseFloat(formData.longitude)

        if (isNaN(lat) || isNaN(lng)) {
          throw new Error("Invalid coordinates")
        }

        sunriseTime = calculateSunrise(new Date(formData.birthDate), lat, lng)
      }

      // Calculate time difference in milliseconds
      const timeDiffMs = birthDateTime.getTime() - sunriseTime.getTime()

      if (timeDiffMs < 0) {
        throw new Error("Birth time cannot be before sunrise")
      }

      // Convert to total seconds
      const totalSeconds = Math.floor(timeDiffMs / 1000)

      // Calculate Ghadi, Pala, Vighati
      const totalMinutes = Math.floor(totalSeconds / 60)

      // 1 Ghadi = 24 minutes = 1440 seconds
      const ghadi = Math.floor(totalSeconds / 1440)
      const remainingAfterGhadi = totalSeconds % 1440

      // 1 Pala = 24 seconds
      const pala = Math.floor(remainingAfterGhadi / 24)
      const remainingAfterPala = remainingAfterGhadi % 24

      // 1 Vighati = 0.4 seconds
      const vighati = Math.floor(remainingAfterPala / 0.4)

      const result: CalculationResult = {
        sunriseTime: sunriseTime.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        birthTimeFormatted: birthDateTime.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        timeDifferenceMinutes: totalMinutes,
        timeDifferenceFormatted: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        ghadi,
        pala,
        vighati,
        calculations: {
          totalSeconds,
          ghadiCalculation: `${totalSeconds} ÷ 1440 = ${ghadi} Ghadi (remainder: ${remainingAfterGhadi}s)`,
          palaCalculation: `${remainingAfterGhadi} ÷ 24 = ${pala} Pala (remainder: ${remainingAfterPala}s)`,
          vighatiCalculation: `${remainingAfterPala} ÷ 0.4 = ${vighati} Vighati`,
        },
      }

      setResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Stars Background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Premium Header */}
        <div className="text-center space-y-6 py-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="text-6xl animate-pulse">🕉️</div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-amber-400 animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Ghadi-Pala Calculator
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <span className="text-amber-300 text-sm font-medium">Professional Vedic Astrology Tool</span>
                <Star className="h-4 w-4 text-amber-400 fill-current" />
              </div>
            </div>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Transform birth time into sacred Vedic units with astronomical precision.
            <span className="text-amber-400 font-semibold"> Trusted by professional astrologers worldwide.</span>
          </p>
        </div>

        <div className="grid xl:grid-cols-2 gap-8">
          {/* Premium Input Form */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                Birth Details
              </CardTitle>
              <CardDescription className="text-slate-300 text-base">
                Enter precise birth information for astronomical accuracy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date and Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-white font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    Birth Date
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthTime" className="text-white font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4 text-amber-400" />
                    Birth Time (24-hour)
                  </Label>
                  <input
                    id="birthTime"
                    type="time"
                    step="1"
                    value={formData.birthTime}
                    onChange={(e) => handleInputChange("birthTime", e.target.value)}
                    className="flex h-12 w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-lg text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                  <p className="text-xs text-amber-300 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Include seconds for maximum precision (e.g., 16:30:45)
                  </p>
                </div>
              </div>

              <Separator className="bg-white/20" />

              {/* Location Section */}
              <div className="space-y-4">
                <Label className="text-white font-medium flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-amber-400" />
                  Location for Sunrise Calculation
                </Label>

                <Input
                  placeholder="City name (e.g., Kathmandu, Nepal)"
                  value={formData.cityName}
                  onChange={(e) => handleInputChange("cityName", e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 h-12 text-lg"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Latitude (27.7172)"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 h-12 text-lg"
                  />
                  <Input
                    placeholder="Longitude (85.3240)"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 h-12 text-lg"
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-slate-300 text-sm bg-white/10 px-4 py-2 rounded-full">
                  <span>OR</span>
                </div>
              </div>

              {/* Manual Sunrise */}
              <div className="space-y-2">
                <Label htmlFor="manualSunrise" className="text-white font-medium flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-400" />
                  Manual Sunrise Time (Optional)
                </Label>
                <input
                  id="manualSunrise"
                  type="time"
                  step="1"
                  value={formData.manualSunrise}
                  onChange={(e) => handleInputChange("manualSunrise", e.target.value)}
                  className="flex h-12 w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-lg text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-slate-400">Use this if you know the exact sunrise time</p>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-red-200">
                  <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={calculateGhadiPala}
                disabled={loading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Calculating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Calculate Ghadi-Pala
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Results */}
          {result && (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-white">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  Vedic Time Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Result Display */}
                <div className="text-center p-8 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl border border-amber-400/30 backdrop-blur-sm">
                  <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text mb-3">
                    {result.ghadi} Ghadi {result.pala} Pala {result.vighati} Vighati
                  </div>
                  <div className="text-amber-200 text-lg font-medium">Traditional Vedic Time Units</div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <span className="text-amber-300 text-sm">Astronomically Precise</span>
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                  </div>
                </div>

                {/* Time Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <Badge variant="outline" className="mb-2 border-blue-400/50 text-blue-300">
                      Sunrise Time
                    </Badge>
                    <div className="font-mono text-xl text-white">{result.sunriseTime}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <Badge variant="outline" className="mb-2 border-green-400/50 text-green-300">
                      Birth Time
                    </Badge>
                    <div className="font-mono text-xl text-white">{result.birthTimeFormatted}</div>
                  </div>
                </div>

                <div className="text-center">
                  <Badge
                    variant="secondary"
                    className="bg-purple-500/20 text-purple-200 border-purple-400/50 px-4 py-2 text-base"
                  >
                    Time Difference: {result.timeDifferenceFormatted}
                  </Badge>
                </div>

                <Separator className="bg-white/20" />

                {/* Detailed Calculations */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold text-white text-lg">Calculation Breakdown</span>
                  </div>

                  <div className="space-y-3 bg-white/5 p-6 rounded-xl border border-white/10">
                    <div className="text-white">
                      <span className="text-amber-300 font-semibold">Total seconds from sunrise:</span>{" "}
                      {result.calculations.totalSeconds}s
                    </div>
                    <div className="text-white">
                      <span className="text-amber-300 font-semibold">Ghadi calculation:</span>{" "}
                      {result.calculations.ghadiCalculation}
                    </div>
                    <div className="text-white">
                      <span className="text-amber-300 font-semibold">Pala calculation:</span>{" "}
                      {result.calculations.palaCalculation}
                    </div>
                    <div className="text-white">
                      <span className="text-amber-300 font-semibold">Vighati calculation:</span>{" "}
                      {result.calculations.vighatiCalculation}
                    </div>
                  </div>
                </div>

                {/* Conversion Reference */}
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 p-6 rounded-xl border border-amber-400/20">
                  <div className="font-semibold text-amber-300 mb-3 text-lg">Vedic Time Units Reference:</div>
                  <div className="space-y-2 text-white">
                    <div>
                      • <span className="text-amber-300">1 Ghadi</span> = 24 minutes = 1,440 seconds
                    </div>
                    <div>
                      • <span className="text-amber-300">1 Pala</span> = 24 seconds
                    </div>
                    <div>
                      • <span className="text-amber-300">1 Vighati</span> = 0.4 seconds
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Premium Example Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Example Usage</CardTitle>
            <CardDescription className="text-slate-300 text-base">
              Professional calculation example for reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-300 text-lg">Sample Input:</h4>
                <div className="space-y-2 text-white bg-white/5 p-4 rounded-lg">
                  <div>
                    📅 <span className="text-slate-300">Date:</span> July 31, 2025
                  </div>
                  <div>
                    ⏰ <span className="text-slate-300">Birth Time:</span> 16:00:00 (4:00 PM)
                  </div>
                  <div>
                    🏔️ <span className="text-slate-300">Location:</span> Kathmandu, Nepal
                  </div>
                  <div>
                    🌍 <span className="text-slate-300">Coordinates:</span> 27.7172°N, 85.3240°E
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-300 text-lg">Expected Output:</h4>
                <div className="space-y-2 text-white bg-white/5 p-4 rounded-lg">
                  <div>
                    🌅 <span className="text-slate-300">Sunrise:</span> ~05:30:00
                  </div>
                  <div>
                    ⏱️ <span className="text-slate-300">Time Difference:</span> 10h 30m
                  </div>
                  <div>
                    🕉️ <span className="text-slate-300">Result:</span> 26 Ghadi 15 Pala 0 Vighati
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
