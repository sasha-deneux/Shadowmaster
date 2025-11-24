"use client"

import { useState, useEffect, useRef } from "react"
import {
  Home,
  BookOpen,
  Crosshair,
  User,
  Shield,
  Cpu,
  CheckCircle,
  Activity,
  Zap,
  AlertTriangle,
  Hexagon,
  Eye,
  Wifi,
  Trophy,
  XCircle,
  Sparkles,
  MessageSquare,
  Send,
  Loader,
} from "lucide-react"

// --- GEMINI API INTEGRATION ---
const apiKey = "" // Key provided by environment

const callGemini = async (prompt, systemInstruction = "") => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Transmission garbled. Re-aligning encryption protocols."
  } catch (error) {
    console.error("Gemini API Error:", error)
    return "Connection severed. The grid is jamming our signal. Try again later."
  }
}

// --- Data: Fictional Lessons ---

const LESSON_DATA = [
  {
    id: 1,
    title: "Visual Casing",
    module: "Module 01 - Surveillance Awareness",
    steps: [
      {
        type: "info",
        content:
          "Before entering any facility, a Ghostwalker must identify the 'eyes' of the building. Dome cameras have a 360° potential view, but they cannot see directly underneath themselves.",
        imageType: "camera_diagram",
      },
      {
        type: "question",
        question:
          "You spot a dome camera mounted 3 meters high on a pillar. To remain undetected without hacking it, where should you position yourself?",
        options: [
          {
            id: "a",
            text: "In the far corner of the room",
            correct: false,
            feedback: "Incorrect. The camera's wide angle covers corners easily.",
          },
          {
            id: "b",
            text: "Directly beneath the pillar",
            correct: true,
            feedback: "Correct. This is the 'Dead Zone' for most standard dome units.",
          },
          {
            id: "c",
            text: "Behind a glass partition",
            correct: false,
            feedback: "Incorrect. IR sensors often penetrate or reflect off standard glass.",
          },
        ],
      },
      {
        type: "question",
        question:
          "Analyze the entry points. Door A has a magnetic sensor. Door B has a pressure plate. Which is safer to bypass with a 'Ghost-Mag' jammer?",
        options: [
          {
            id: "a",
            text: "Door A (Magnetic)",
            correct: true,
            feedback: "Correct. Magnetic contacts are easily spoofed by local fields.",
          },
          {
            id: "b",
            text: "Door B (Pressure)",
            correct: false,
            feedback: "Incorrect. Pressure plates are mechanical and immune to digital jamming.",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Digital Silence",
    module: "Module 02 - Cyber Stealth",
    steps: [
      {
        type: "info",
        content:
          "Your smartphone is a beacon. Even in airplane mode, NFC chips can trigger passive sensors in high-security vaults.",
        imageType: "phone_signal",
      },
      {
        type: "question",
        question: "You are approaching a Class-4 Vault. What is the standard protocol for your personal electronics?",
        options: [
          {
            id: "a",
            text: "Turn them off",
            correct: false,
            feedback: "Insufficient. Batteries still provide a signature.",
          },
          {
            id: "b",
            text: "Faraday Bag containment",
            correct: true,
            feedback: "Correct. Total signal isolation is required.",
          },
          {
            id: "c",
            text: "Leave them at the safehouse",
            correct: false,
            feedback: "Risky. You may need them for exfiltration coordination.",
          },
        ],
      },
    ],
  },
]

const LEADERBOARD_DATA = [
  { rank: 1, name: "Specter-08", xp: 5200, tier: "Gold" },
  { rank: 2, name: "Nightshade-42", xp: 4950, tier: "Silver" },
  { rank: 3, name: "Cipher-9", xp: 4800, tier: "Silver" },
  { rank: 4, name: "NOVA-27 (YOU)", xp: 4120, tier: "Bronze", isUser: true },
  { rank: 5, name: "Rook_Zero", xp: 3900, tier: "Bronze" },
]

// --- Components ---

const GlowCard = ({ children, className = "", onClick, active = false }) => (
  <div
    onClick={onClick}
    className={`relative bg-slate-900/80 border transition-all duration-300 ${
      active
        ? "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
        : "border-slate-700/50 shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:border-cyan-500/50"
    } rounded-2xl p-4 backdrop-blur-md ${className} ${onClick ? "cursor-pointer" : ""}`}
  >
    {children}
  </div>
)

const Button = ({ children, variant = "primary", className = "", onClick, disabled }) => {
  const baseStyle =
    "w-full py-3 rounded-xl font-bold tracking-wide transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
  const variants = {
    primary:
      "bg-cyan-500/10 border border-cyan-400 text-cyan-50 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]",
    secondary: "bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700",
    success: "bg-green-500/10 border border-green-500 text-green-400 hover:bg-green-500/20",
    danger: "bg-red-500/10 border border-red-500 text-red-400",
    magic:
      "bg-purple-500/10 border border-purple-400 text-purple-300 hover:bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
  }

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

const ProgressBar = ({ progress, color = "bg-cyan-400", height = "h-2" }) => (
  <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height}`}>
    <div
      className={`${height} ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]`}
      style={{ width: `${progress}%` }}
    />
  </div>
)

// --- Sub-Screens ---

// --- 1. HOME SCREEN ---
const HomeScreen = ({ navigate, userStats }) => (
  <div className="space-y-6 pb-24 animate-fadeIn">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-black text-white tracking-wider">ShadowMaster Hub</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-xs text-cyan-400 font-medium uppercase tracking-widest">Daily Training Active</span>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 flex items-center gap-2">
          <Zap size={14} className="text-orange-400 fill-orange-400" />
          <span className="text-xs font-bold text-orange-400">{userStats.streak}</span>
        </div>
        <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 flex items-center gap-2">
          <Hexagon size={14} className="text-cyan-400 fill-cyan-400/20" />
          <span className="text-xs font-bold text-cyan-400">{userStats.xp} XP</span>
        </div>
      </div>
    </div>

    {/* Main Action Card */}
    <GlowCard className="p-6 relative overflow-hidden group" onClick={() => navigate("lesson", { lessonId: 1 })}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

      <Button variant="primary" className="mb-6 text-lg py-4 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
        Start Lesson
      </Button>

      <div className="space-y-4">
        <div>
          <h3 className="text-slate-400 text-sm uppercase tracking-wider">Current Objective</h3>
          <p className="text-white text-lg font-bold">Visual Casing</p>
        </div>

        <div className="flex justify-between items-end border-t border-slate-700/50 pt-4">
          <div>
            <span className="block text-2xl font-black text-cyan-400">+50 XP</span>
            <span className="text-xs text-slate-400 uppercase">Reward</span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-orange-400">
              <Zap size={16} fill="currentColor" />
              <span className="font-bold">Streak Bonus</span>
            </div>
          </div>
        </div>
      </div>
    </GlowCard>

    {/* XP Track Preview */}
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
        <span>Rookie</span>
        <span className="text-cyan-400">Ghostwalker</span>
      </div>
      <ProgressBar progress={(userStats.xp % 1000) / 10} color="bg-orange-500" />
      <p className="text-right text-xs text-slate-400 pt-1">Rank Progress</p>
    </div>

    {/* Quick Modules */}
    <div className="grid grid-cols-4 gap-3">
      {[
        { icon: BookOpen, label: "Lessons", action: () => navigate("lessons_list") },
        { icon: Crosshair, label: "Missions", action: () => navigate("missions") },
        { icon: MessageSquare, label: "Oracle", action: () => navigate("mentor") },
        { icon: Cpu, label: "Sims", action: () => navigate("sims") },
      ].map((item, idx) => (
        <button
          key={idx}
          onClick={item.action}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-colors"
        >
          <item.icon className={item.label === "Oracle" ? "text-purple-400" : "text-cyan-400"} size={24} />
          <span className="text-[10px] uppercase font-bold text-slate-400">{item.label}</span>
        </button>
      ))}
    </div>
  </div>
)

// --- 2. LESSON SCREEN ---
const LessonScreen = ({ navigate, lessonId, onComplete }) => {
  const lesson = LESSON_DATA.find((l) => l.id === lessonId) || LESSON_DATA[0]
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [status, setStatus] = useState("active") // active, correct, incorrect, info_done

  const currentStep = lesson.steps[stepIndex]
  const progress = (stepIndex / lesson.steps.length) * 100

  const handleConfirm = () => {
    if (currentStep.type === "info") {
      setStatus("info_done")
      return
    }

    if (selectedOption) {
      const option = currentStep.options.find((o) => o.id === selectedOption)
      if (option.correct) {
        setStatus("correct")
      } else {
        setStatus("incorrect")
      }
    }
  }

  const handleNext = () => {
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex(stepIndex + 1)
      setSelectedOption(null)
      setStatus("active")
    } else {
      onComplete(50) // Award XP
      navigate("home")
    }
  }

  return (
    <div className="h-full flex flex-col pb-24 animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-white">{lesson.title}</h2>
          <p className="text-xs text-cyan-400 uppercase tracking-wider">{lesson.module}</p>
        </div>
        <button onClick={() => navigate("home")} className="text-slate-500 hover:text-white">
          <XCircle />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <ProgressBar progress={progress + (status !== "active" ? 100 / lesson.steps.length : 0)} height="h-3" />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center relative mb-8 overflow-y-auto">
        {/* Visual / Info Block */}
        <div className="w-full aspect-video bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center mb-6 relative overflow-hidden">
          {currentStep.imageType === "camera_diagram" && (
            <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
              <div className="w-4 h-32 bg-slate-700 absolute top-0" /> {/* Pole */}
              <div className="w-16 h-12 bg-slate-600 rounded-b-full absolute top-24 z-10 flex items-center justify-center">
                {" "}
                {/* Camera */}
                <div className="w-4 h-4 bg-red-900 rounded-full animate-pulse" />
              </div>
              {/* Vision Cones */}
              <div
                className="absolute top-32 w-64 h-32 bg-red-500/10 border-l border-r border-b border-red-500/30 rounded-b-full"
                style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }}
              ></div>
              <div className="absolute top-36 text-xs text-red-400 font-mono font-bold">Active Zone</div>
              <div className="absolute top-24 text-[10px] text-green-400 font-mono font-bold bg-slate-900/80 px-1 rounded z-20">
                Blind Spot
              </div>
            </div>
          )}
          {currentStep.imageType === "phone_signal" && (
            <div className="flex items-center justify-center gap-4">
              <Wifi size={48} className="text-red-500 animate-ping absolute" />
              <Wifi size={48} className="text-red-500 relative" />
            </div>
          )}
          {!currentStep.imageType && <Eye size={64} className="text-slate-700" />}
        </div>

        <div className="text-center space-y-4 w-full">
          {currentStep.type === "info" ? (
            <p className="text-slate-200 text-lg leading-relaxed">{currentStep.content}</p>
          ) : (
            <p className="text-white text-lg font-bold">{currentStep.question}</p>
          )}
        </div>
      </div>

      {/* Feedback Area */}
      {(status === "correct" || status === "incorrect") && (
        <div
          className={`mb-4 p-4 rounded-xl flex items-start gap-3 animate-slideUp border ${status === "correct" ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50"}`}
        >
          {status === "correct" ? (
            <CheckCircle className="text-green-400 shrink-0" size={20} />
          ) : (
            <AlertTriangle className="text-red-400 shrink-0" size={20} />
          )}
          <div>
            <p className={`${status === "correct" ? "text-green-400" : "text-red-400"} font-bold text-sm`}>
              {status === "correct" ? "Correct Analysis" : "Mission Critical Error"}
            </p>
            <p className="text-slate-300 text-xs mt-1">
              {currentStep.options.find((o) => o.id === selectedOption).feedback}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 mt-auto">
        {currentStep.type === "question" && status === "active" && (
          <div className="flex flex-col gap-3">
            {currentStep.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${selectedOption === opt.id ? "bg-cyan-900/30 border-cyan-400 text-cyan-100" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"}`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {status === "active" ? (
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={currentStep.type === "question" && !selectedOption}
          >
            {currentStep.type === "info" ? "Understood" : "Confirm"}
          </Button>
        ) : (
          <Button
            variant={status === "incorrect" ? "danger" : "success"}
            onClick={status === "incorrect" ? () => setStatus("active") : handleNext}
          >
            {status === "incorrect"
              ? "Try Again"
              : stepIndex === lesson.steps.length - 1
                ? "Complete Module"
                : "Continue ->"}
          </Button>
        )}
      </div>
    </div>
  )
}

// --- 3. MISSION SCREEN (With Gemini Generator) ---
const MissionScreen = ({ navigate }) => {
  const [view, setView] = useState("briefing") // briefing, map, success, generator
  const [simulating, setSimulating] = useState(false)
  const [loadingGen, setLoadingGen] = useState(false)
  const [generatedMission, setGeneratedMission] = useState(null)

  const launchSim = () => {
    setSimulating(true)
    setTimeout(() => {
      setSimulating(false)
      setView("success")
    }, 2000)
  }

  const generateMission = async () => {
    setLoadingGen(true)
    const prompt =
      "Generate a short, unique cybersecurity/heist mission briefing. Return JSON with keys: 'codename', 'difficulty', 'objective', 'threat', 'tactics'. Make it sound futuristic and dangerous."
    const system = "You are a tactical mission computer for elite thieves. Output strict JSON only."

    try {
      let result = await callGemini(prompt, system)
      // Clean up markdown code blocks if present
      result = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
      const mission = JSON.parse(result)
      setGeneratedMission(mission)
    } catch (e) {
      setGeneratedMission({
        codename: "Operation: Static Noise",
        difficulty: "Unknown",
        objective: "Manual Override Required. AI Generation Failed.",
        threat: "Critical",
        tactics: "Proceed with caution.",
      })
    }
    setLoadingGen(false)
  }

  if (view === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full pb-24 text-center space-y-6 animate-fadeIn">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={48} className="text-green-400" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase">Mission Success</h2>
        <p className="text-slate-400">The objective was secured without triggering the PulseGrid.</p>

        <GlowCard className="w-full border-green-500/30 bg-green-900/10">
          <div className="flex justify-between mb-2">
            <span className="text-slate-400 text-sm">Stealth Rating</span>
            <span className="text-green-400 font-bold">S-Tier</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Reward</span>
            <span className="text-cyan-400 font-bold">+120 XP</span>
          </div>
        </GlowCard>

        <Button variant="primary" onClick={() => setView("briefing")}>
          Return to HQ
        </Button>
      </div>
    )
  }

  return (
    <div className="pb-24 animate-fadeIn">
      {/* Tab Switcher */}
      <div className="flex bg-slate-900 p-1 rounded-xl mb-6">
        <button
          onClick={() => setView("briefing")}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${view === "briefing" ? "bg-slate-800 text-cyan-400 shadow-sm" : "text-slate-500"}`}
        >
          Briefing
        </button>
        <button
          onClick={() => setView("map")}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${view === "map" ? "bg-slate-800 text-cyan-400 shadow-sm" : "text-slate-500"}`}
        >
          Sim Map
        </button>
      </div>

      {view === "briefing" ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              {generatedMission ? generatedMission.codename : "Op: Paloma Extraction"}
            </h2>
            <p className="text-cyan-400 text-sm tracking-widest mt-1">
              DIFFICULTY: {generatedMission ? generatedMission.difficulty.toUpperCase() : "INTERMEDIATE"}
            </p>
          </div>

          <GlowCard className="space-y-4">
            <div className="border-b border-slate-700/50 pb-4">
              <span className="text-slate-400 text-xs uppercase block mb-1">Primary Objective</span>
              <p className="text-white font-bold text-sm">
                {generatedMission
                  ? generatedMission.objective
                  : "Simulate the extraction of a high-value artifact (Paloma Lisa replica)"}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs uppercase">Threat Model</span>
              <span className="text-orange-400 font-mono text-sm">
                {generatedMission ? generatedMission.threat : "Moderate"}
              </span>
            </div>
            {generatedMission && (
              <div className="pt-2">
                <span className="text-slate-400 text-xs uppercase block mb-1">Tactical Advice</span>
                <p className="text-xs text-slate-300 italic">"{generatedMission.tactics}"</p>
              </div>
            )}
          </GlowCard>

          <Button variant="primary" onClick={() => setView("map")}>
            Inspect Route
          </Button>

          <div className="pt-4 border-t border-slate-800">
            <Button variant="magic" onClick={generateMission} disabled={loadingGen}>
              {loadingGen ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} /> Generate New Contract ✨
                </>
              )}
            </Button>
            <p className="text-[10px] text-center text-slate-500 mt-2">Powered by Gemini Operational Intelligence</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Map Placeholder */}
          <div className="aspect-square bg-slate-900 rounded-xl border border-cyan-500/30 relative overflow-hidden p-4">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, #22d3ee 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* Rooms */}
            <div className="w-full h-full border-2 border-slate-700 relative">
              <div className="absolute top-0 left-0 w-1/3 h-1/3 border-r-2 border-b-2 border-slate-700"></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 border-l-2 border-t-2 border-slate-700"></div>

              {/* Path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 50 300 Q 150 150 300 50"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
                <circle cx="50" cy="300" r="4" fill="#22d3ee" />
                <circle cx="300" cy="50" r="4" fill="#f97316" />
              </svg>
            </div>

            {simulating && (
              <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center backdrop-blur-sm z-50">
                <div className="text-cyan-400 font-mono text-sm animate-pulse">EXECUTING PROTOCOLS...</div>
              </div>
            )}
          </div>

          <Button variant="primary" onClick={launchSim} disabled={simulating}>
            {simulating ? "Running Simulation..." : "Launch Simulation"}
          </Button>
        </div>
      )}
    </div>
  )
}

// --- 4. MENTOR SCREEN (Gemini Chat) ---
const MentorScreen = () => {
  const [messages, setMessages] = useState([
    {
      role: "system",
      text: "Connection established. I am Ghostwalker Prime. What tactical data do you require, Rookie?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg = { role: "user", text: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    const systemPrompt =
      "You are Ghostwalker Prime, an elite master thief instructor in a cyberpunk setting. You are teaching a rookie. Be cryptic, professional, use slang like 'flux-state', 'grid-lock', 'zero-day'. Keep answers under 50 words. Focus on stealth, security, and social engineering."

    const responseText = await callGemini(input, systemPrompt)

    setMessages((prev) => [...prev, { role: "system", text: responseText }])
    setLoading(false)
  }

  return (
    <div className="h-full flex flex-col pb-24 animate-fadeIn">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center">
          <Sparkles size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">The Oracle</h2>
          <p className="text-xs text-purple-400">AI Tactical Mentor • Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-xl text-sm ${
                msg.role === "user"
                  ? "bg-slate-800 text-white rounded-br-none"
                  : "bg-purple-900/20 border border-purple-500/30 text-purple-200 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-purple-900/20 border border-purple-500/30 px-4 py-3 rounded-xl rounded-bl-none flex gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask for tactical advice..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-purple-400 text-white placeholder:text-slate-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="absolute right-2 top-2 p-1.5 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/40 transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

// --- 5. PROFILE SCREEN ---
const ProfileScreen = ({ userStats }) => {
  const [activeTab, setActiveTab] = useState("stats") // stats, leaderboard

  return (
    <div className="pb-24 animate-fadeIn space-y-6">
      {/* Tab Toggle */}
      <div className="flex bg-slate-900 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === "stats" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500"}`}
        >
          My Stats
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === "leaderboard" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500"}`}
        >
          Global Ranking
        </button>
      </div>

      {activeTab === "stats" ? (
        <>
          {/* ID Card */}
          <GlowCard className="border-cyan-500/30">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-black text-white">NOVA-27</h2>
                <p className="text-cyan-400 font-bold text-sm">Rank: Ghostwalker</p>
              </div>
              <Hexagon size={40} className="text-slate-700" fill="currentColor" />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{userStats.xp}</div>
                <div className="text-[10px] text-slate-400 uppercase">Total XP</div>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">Lvl 3</div>
                <div className="text-[10px] text-slate-400 uppercase">Mastery</div>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-400">Infiltrator</div>
                <div className="text-[10px] text-slate-400 uppercase">Specialization</div>
              </div>
            </div>
          </GlowCard>

          {/* Stat Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <Activity className="text-cyan-400 mb-2" size={20} />
              <div className="text-2xl font-bold text-white">82%</div>
              <div className="text-[10px] text-slate-500 uppercase">Sim Success</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <Shield className="text-orange-400 mb-2" size={20} />
              <div className="text-2xl font-bold text-white">07</div>
              <div className="text-[10px] text-slate-500 uppercase">Missions Cleared</div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4 animate-slideUp">
          <GlowCard className="bg-gradient-to-r from-slate-900 to-slate-800 border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Your Current Rank</p>
                <h3 className="text-3xl font-black text-white italic">#4</h3>
              </div>
              <Trophy size={32} className="text-amber-500" />
            </div>
            <div className="mt-2 text-xs text-slate-400">Top 5% of operatives globally</div>
          </GlowCard>

          <div className="space-y-2">
            {LEADERBOARD_DATA.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center p-3 rounded-xl border ${user.isUser ? "bg-cyan-900/20 border-cyan-500/50" : "bg-slate-900 border-slate-800"}`}
              >
                <div
                  className={`w-8 font-bold text-center ${user.rank === 1 ? "text-yellow-400" : user.rank === 2 ? "text-slate-300" : user.rank === 3 ? "text-amber-600" : "text-slate-500"}`}
                >
                  #{user.rank}
                </div>
                <div className="flex-1 px-3">
                  <div className={`font-bold text-sm ${user.isUser ? "text-cyan-400" : "text-white"}`}>{user.name}</div>
                  <div className="text-[10px] text-slate-500">{user.tier} Tier</div>
                </div>
                <div className="text-sm font-mono text-slate-300 font-bold">{user.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const LessonsListScreen = ({ navigate }) => (
  <div className="pb-24 animate-fadeIn space-y-4">
    <h2 className="text-2xl font-bold text-white mb-4">Training Modules</h2>
    {LESSON_DATA.map((l) => (
      <GlowCard
        key={l.id}
        className="flex items-center justify-between"
        onClick={() => navigate("lesson", { lessonId: l.id })}
      >
        <div>
          <div className="text-xs text-cyan-400 uppercase font-bold mb-1">{l.module}</div>
          <h3 className="text-white font-bold">{l.title}</h3>
        </div>
        <Button variant="secondary" className="w-auto h-auto px-4 py-2 text-xs">
          Start
        </Button>
      </GlowCard>
    ))}
    <div className="p-4 border border-dashed border-slate-700 rounded-xl text-center text-slate-500 text-sm">
      More modules unlocking at Level 4
    </div>
  </div>
)

// --- Main Layout ---

export default function ShadowMasterHub() {
  const [currentTab, setCurrentTab] = useState("home")
  const [subView, setSubView] = useState(null)
  const [subViewParams, setSubViewParams] = useState({})

  // State for user progress
  const [userStats, setUserStats] = useState({
    xp: 4120,
    streak: 4,
    lessonsCompleted: 24,
  })

  const navigate = (view, params = {}) => {
    if (view === "home") {
      setCurrentTab("home")
      setSubView(null)
    } else if (["lessons", "missions", "profile", "mentor"].includes(view)) {
      setCurrentTab(view)
      setSubView(null)
    } else {
      setSubView(view)
      setSubViewParams(params)
    }
  }

  const handleLessonComplete = (xpGained) => {
    setUserStats((prev) => ({
      ...prev,
      xp: prev.xp + xpGained,
      lessonsCompleted: prev.lessonsCompleted + 1,
    }))
  }

  const renderContent = () => {
    if (subView === "lesson")
      return <LessonScreen navigate={navigate} lessonId={subViewParams.lessonId} onComplete={handleLessonComplete} />
    if (subView === "lessons_list") return <LessonsListScreen navigate={navigate} />
    if (subView === "roles")
      return <div className="text-center text-slate-500 mt-20">Roles Classified (Coming Soon)</div>
    if (subView === "sims") return <MissionScreen navigate={navigate} /> // Shortcut to mission

    switch (currentTab) {
      case "home":
        return <HomeScreen navigate={navigate} userStats={userStats} />
      case "lessons":
        return <LessonsListScreen navigate={navigate} />
      case "missions":
        return <MissionScreen navigate={navigate} />
      case "mentor":
        return <MentorScreen />
      case "profile":
        return <ProfileScreen userStats={userStats} />
      default:
        return <HomeScreen navigate={navigate} userStats={userStats} />
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyan-900/5 to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="max-w-md mx-auto min-h-screen relative flex flex-col">
        {/* Dynamic Content */}
        <div className="flex-1 p-5 pt-8 overflow-y-auto no-scrollbar">{renderContent()}</div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 z-50 pb-safe">
          <div className="flex justify-around items-center max-w-md mx-auto px-2 py-3">
            {[
              { id: "home", icon: Home, label: "Home" },
              { id: "lessons", icon: BookOpen, label: "Lessons" },
              { id: "missions", icon: Crosshair, label: "Missions" },
              { id: "profile", icon: User, label: "Profile" },
              { id: "mentor", icon: MessageSquare, label: "Oracle" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                  currentTab === item.id ? "text-cyan-400 translate-y-[-4px]" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <item.icon
                  size={24}
                  strokeWidth={currentTab === item.id ? 2.5 : 2}
                  className={currentTab === item.id ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : ""}
                />
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                {currentTab === item.id && <div className="w-1 h-1 bg-cyan-400 rounded-full absolute bottom-1" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
