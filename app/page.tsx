"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  Edit3,
  Copy,
  RotateCcw,
  Upload,
  Kanban,
  Home,
  MessageSquare,
  Target,
  FileText,
  X,
  Loader2,
  Paperclip,
  User,
  Bot,
  Sparkles,
  Zap,
  Brain,
  Shield,
  Layers,
  Palette,
  Code,
  File,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Clock,
  Settings,
  HelpCircle,
  Archive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import ReactMarkdown from "react-markdown"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

const API_KEY = "AIzaSyC4v647dYrneDbR2K5BJwJ4sbvq43fZtRc" // Replace with your actual API key
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

interface Message {
  role: "user" | "model" | "system"
  parts: { text: string }[]
  timestamp: Date
  attachedFile?: { name: string; url: string; type: string }
}

interface Artifact {
  id: string
  title: string
  content: string
  type: "prd" | "okr" | "roadmap" | "persona" | "wireframe" | "strategy" | "research" | "other"
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface Template {
  id: string
  name: string
  description: string
  type: "prd" | "okr" | "roadmap" | "persona" | "wireframe" | "strategy" | "research" | "other"
  icon: any
  content: string
}

const TEMPLATES: Template[] = [
  {
    id: "prd",
    name: "Product Requirements Document",
    description: "Comprehensive PRD template for new features",
    type: "prd",
    icon: FileText,
    content: `# Product Requirements Document

## Overview
Brief description of the product/feature

## Objectives
- Primary objective
- Secondary objectives

## User Stories
- As a [user type], I want [goal] so that [benefit]

## Requirements
### Functional Requirements
- Requirement 1
- Requirement 2

### Non-Functional Requirements
- Performance requirements
- Security requirements

## Success Metrics
- Metric 1
- Metric 2

## Timeline
- Phase 1: [dates]
- Phase 2: [dates]`
  },
  {
    id: "okr",
    name: "OKR Framework",
    description: "Objectives and Key Results template",
    type: "okr",
    icon: Target,
    content: `# OKR: [Quarter/Period]

## Objective: [Main Goal]

### Key Results:
1. **KR1:** [Specific, measurable outcome]
   - Current: [baseline]
   - Target: [goal]
   - Progress: [%]

2. **KR2:** [Specific, measurable outcome]
   - Current: [baseline]
   - Target: [goal]
   - Progress: [%]

3. **KR3:** [Specific, measurable outcome]
   - Current: [baseline]
   - Target: [goal]
   - Progress: [%]

## Initiatives
- Initiative 1
- Initiative 2
- Initiative 3`
  },
  {
    id: "roadmap",
    name: "Product Roadmap",
    description: "Strategic product roadmap template",
    type: "roadmap",
    icon: Layers,
    content: `# Product Roadmap

## Vision
[Product vision statement]

## Q1 Goals
### Major Features
- Feature 1
- Feature 2

### Improvements
- Improvement 1
- Improvement 2

## Q2 Goals
### Major Features
- Feature 3
- Feature 4

### Improvements
- Improvement 3
- Improvement 4

## Q3-Q4 Outlook
### Strategic Initiatives
- Initiative 1
- Initiative 2

### Research & Discovery
- Research area 1
- Research area 2`
  },
  {
    id: "persona",
    name: "User Persona",
    description: "Detailed user persona template",
    type: "persona",
    icon: User,
    content: `# User Persona: [Persona Name]

## Demographics
- **Age:** [age range]
- **Location:** [location]
- **Occupation:** [job title]
- **Income:** [income range]

## Psychographics
- **Goals:** [primary goals]
- **Frustrations:** [main pain points]
- **Motivations:** [what drives them]

## Behavior Patterns
- **Technology Usage:** [how they use tech]
- **Shopping Habits:** [buying behavior]
- **Communication Preferences:** [preferred channels]

## Needs & Pain Points
### Needs
- Need 1
- Need 2
- Need 3

### Pain Points
- Pain point 1
- Pain point 2
- Pain point 3

## How Our Product Helps
- Solution 1
- Solution 2
- Solution 3`
  },
  {
    id: "strategy",
    name: "Go-to-Market Strategy",
    description: "Comprehensive GTM strategy template",
    type: "strategy",
    icon: Sparkles,
    content: `# Go-to-Market Strategy

## Product Overview
- **Product:** [product name]
- **Target Market:** [market segment]
- **Value Proposition:** [unique value]

## Market Analysis
### Target Audience
- Primary: [description]
- Secondary: [description]

### Competitive Landscape
- Competitor 1: [analysis]
- Competitor 2: [analysis]

## Marketing Strategy
### Positioning
[How we position the product]

### Messaging
- Core message: [main message]
- Supporting messages: [additional messages]

### Channels
- Channel 1: [strategy]
- Channel 2: [strategy]
- Channel 3: [strategy]

## Launch Plan
### Pre-Launch (Weeks 1-4)
- Activity 1
- Activity 2

### Launch (Weeks 5-8)
- Activity 1
- Activity 2

### Post-Launch (Weeks 9-12)
- Activity 1
- Activity 2

## Success Metrics
- Metric 1: [target]
- Metric 2: [target]
- Metric 3: [target]`
  },
  {
    id: "research",
    name: "User Research Plan",
    description: "User research and testing plan",
    type: "research",
    icon: Search,
    content: `# User Research Plan

## Research Objectives
- Primary objective: [main goal]
- Secondary objectives: [additional goals]

## Research Questions
1. [Question 1]
2. [Question 2]
3. [Question 3]

## Methodology
### Research Type
- [Qualitative/Quantitative]
- [Method: interviews, surveys, usability testing, etc.]

### Participants
- **Target Audience:** [description]
- **Sample Size:** [number]
- **Recruitment Criteria:** [criteria]

## Research Activities
### Phase 1: Discovery
- Activity 1
- Activity 2

### Phase 2: Validation
- Activity 1
- Activity 2

### Phase 3: Testing
- Activity 1
- Activity 2

## Timeline
- Week 1: [activities]
- Week 2: [activities]
- Week 3: [activities]
- Week 4: [activities]

## Deliverables
- Research report
- User insights
- Recommendations
- Next steps`
  }
]

export default function ProductNow() {
  const [activeSection, setActiveSection] = useState("home")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [backgroundInfo, setBackgroundInfo] = useState<{
    file: string | null
    text: string | null
  }>({
    file: null,
    text: null,
  })
  const [backgroundFileContent, setBackgroundFileContent] = useState<string | null>(null)
  const [backgroundFileName, setBackgroundFileName] = useState<string | null>(null)
  const [backgroundText, setBackgroundText] = useState<string | null>(null)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [viewingArtifact, setViewingArtifact] = useState<Artifact | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateSearch, setTemplateSearch] = useState("")
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(null)
  const [pendingEdit, setPendingEdit] = useState<string | null>(null)
  const [artifactMessages, setArtifactMessages] = useState<Message[]>([])
  const [artifactInput, setArtifactInput] = useState("")
  const [isArtifactLoading, setIsArtifactLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const artifactMessagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundFileInputRef = useRef<HTMLInputElement>(null)
  const chatFileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollArtifactToBottom = () => {
    artifactMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    scrollArtifactToBottom()
  }, [artifactMessages])

  const getBackgroundPrompt = useCallback(() => {
    let prompt = ""
    if (backgroundInfo.file) prompt += backgroundInfo.file + "\n"
    if (backgroundInfo.text) prompt += backgroundInfo.text + "\n"
    return prompt.trim()
  }, [backgroundInfo.file, backgroundInfo.text])

  const sendApiRequest = async (promptText: string, messagesHistory: Message[], isArtifactChat = false) => {
    try {
      const contextParts: string[] = []
      contextParts.push("You are Neura, a Product Manager AI assistant. Always start your responses with 'Neura: ' and focus on product management expertise.")

      const backgroundPrompt = getBackgroundPrompt()
      if (backgroundPrompt) {
        contextParts.push("[Background Information]\n" + backgroundPrompt)
      }

      if (isArtifactChat && viewingArtifact) {
        contextParts.push(`[Current Artifact]\nTitle: ${viewingArtifact.title}\nContent:\n${viewingArtifact.content}`)
        contextParts.push("When suggesting edits, provide specific suggestions that the user can approve or reject. Format suggestions clearly.")
      }

      const apiHistory = messagesHistory
        .filter((m) => m.role === "user" || m.role === "model")
        .map(({ role, parts }) => ({ role, parts }))

      const fullHistory = [{ role: "user" as const, parts: [{ text: contextParts.join("\n\n") }] }, ...apiHistory]

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: fullHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "API request failed")
      }

      const data = await response.json()
      const candidate = data?.candidates?.[0]

      let aiResponse = ""
      if (candidate?.content) {
        const { content } = candidate
        if (Array.isArray((content as any).parts)) {
          aiResponse = (content as any).parts
            .map((p: any) => (typeof p === "string" ? p : typeof p?.text === "string" ? p.text : ""))
            .join("")
        }
      }

      if (!aiResponse.trim()) {
        aiResponse = "Neura: I didn't receive any content from the model. Please rephrase or try again later."
      }

      const aiMessage: Message = {
        role: "model",
        parts: [{ text: aiResponse }],
        timestamp: new Date(),
      }

      if (isArtifactChat) {
        setArtifactMessages((prev) => [...prev, aiMessage])
      } else {
        setMessages((prev) => [...prev, aiMessage])
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = "Neura: Sorry, I encountered an error. Please try again."
      const errorMsg: Message = {
        role: "model",
        parts: [{ text: errorMessage }],
        timestamp: new Date(),
      }

      if (isArtifactChat) {
        setArtifactMessages((prev) => [...prev, errorMsg])
      } else {
        setMessages((prev) => [...prev, errorMsg])
      }
    } finally {
      if (isArtifactChat) {
        setIsArtifactLoading(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  const sendMessage = async (messageContent: string, isArtifactChat = false) => {
    if (!messageContent.trim() || (isArtifactChat ? isArtifactLoading : isLoading)) return

    const userMessage: Message = {
      role: "user",
      parts: [{ text: messageContent }],
      timestamp: new Date(),
    }

    if (isArtifactChat) {
      setArtifactMessages((prev) => [...prev, userMessage])
      setIsArtifactLoading(true)
      setArtifactInput("")
      await sendApiRequest(messageContent, [...artifactMessages, userMessage], true)
    } else {
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setInput("")
      await sendApiRequest(messageContent, [...messages, userMessage], false)
    }
  }

  const handleFileUpload = async (file: File, type: "background" | "chat") => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (type === "background") {
        setBackgroundFileContent(content)
        setBackgroundFileName(file.name)
      } else if (type === "chat") {
        const userMessage: Message = {
          role: "user",
          parts: [
            { text: `Attached file: ${file.name}\n\n${content.substring(0, 500)}${content.length > 500 ? "..." : ""}` },
          ],
          attachedFile: {
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type,
          },
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
      }
    }
    reader.readAsText(file)
  }

  const saveBackground = () => {
    setBackgroundInfo({
      file: backgroundFileContent,
      text: backgroundText,
    })
    alert("Background information saved!")
  }

  const createArtifactFromTemplate = async (template: Template) => {
    if (!getBackgroundPrompt().trim()) {
      alert("Please add background information first to generate meaningful content.")
      setActiveSection("background")
      return
    }

    setIsLoading(true)
    setShowTemplates(false)

    const prompt = `Create a ${template.name} based on the background information provided. Use the template structure but fill it with relevant, specific content based on the context. Make it comprehensive and actionable.`

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Background Information:\n${getBackgroundPrompt()}\n\nTemplate:\n${template.content}\n\nInstructions: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      })

      const data = await response.json()
      const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || template.content

      const newArtifact: Artifact = {
        id: Date.now().toString(),
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        content: generatedContent,
        type: template.type,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [template.type],
      }

      setArtifacts((prev) => [newArtifact, ...prev])
      setViewingArtifact(newArtifact)
      setActiveSection("hub")
    } catch (error) {
      console.error("Error creating artifact:", error)
      alert("Error creating artifact. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateArtifact = (updates: Partial<Artifact>) => {
    if (!viewingArtifact) return

    const updatedArtifact = {
      ...viewingArtifact,
      ...updates,
      updatedAt: new Date(),
    }

    setArtifacts((prev) => prev.map((artifact) => (artifact.id === viewingArtifact.id ? updatedArtifact : artifact)))
    setViewingArtifact(updatedArtifact)
  }

  const applyEdit = () => {
    if (pendingEdit && viewingArtifact) {
      updateArtifact({ content: pendingEdit })
      setPendingEdit(null)
      setEditingSuggestion(null)
    }
  }

  const rejectEdit = () => {
    setPendingEdit(null)
    setEditingSuggestion(null)
  }

  const filteredTemplates = TEMPLATES.filter((template) =>
    template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    template.description.toLowerCase().includes(templateSearch.toLowerCase())
  )

  const NavButton = ({
    icon: Icon,
    label,
    section,
    isActive,
  }: {
    icon: any
    label: string
    section: string
    isActive: boolean
  }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all cursor-pointer ${
        isActive ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" : "hover:bg-blue-50 text-gray-700"
      }`}
      onClick={() => setActiveSection(section)}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )

  const SidebarButton = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) => (
    <Button
      variant="ghost"
      size="sm"
      className="w-10 h-10 p-0 hover:bg-blue-50 group relative"
      onClick={onClick}
    >
      <Icon className="w-4 h-4 text-gray-600" />
      <div className="absolute left-12 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    </Button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Quick Access Sidebar */}
      <div className="w-16 bg-white/90 backdrop-blur-xl border-r border-blue-100 flex flex-col items-center py-4 space-y-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
          <span className="text-white font-bold text-sm">PN</span>
        </div>
        <SidebarButton icon={Clock} label="Previous Chats" onClick={() => {}} />
        <SidebarButton icon={Layers} label="Background Context" onClick={() => setActiveSection("background")} />
        <SidebarButton icon={Settings} label="Permissions" onClick={() => {}} />
        <SidebarButton icon={HelpCircle} label="Instructions" onClick={() => {}} />
        <SidebarButton icon={Archive} label="Archive" onClick={() => {}} />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <span className="font-semibold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ProductNow
              </span>
              <div className="flex items-center gap-2">
                <NavButton icon={Home} label="Home" section="home" isActive={activeSection === "home"} />
                <NavButton icon={FileText} label="Hub" section="hub" isActive={activeSection === "hub"} />
                <NavButton icon={MessageSquare} label="Chat" section="chat" isActive={activeSection === "chat"} />
                <NavButton icon={Layers} label="Background" section="background" isActive={activeSection === "background"} />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Home Section */}
          {activeSection === "home" && (
            <div className="text-center py-20">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  ProductNow
                </h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Your vision. AI that builds with you—from idea to launch. Streamline product development with Neura, your AI Product Manager.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                  {[
                    { icon: FileText, title: "Content Hub", desc: "View and edit AI-generated artifacts", section: "hub" },
                    { icon: MessageSquare, title: "Chat with Neura", desc: "Get product management insights", section: "chat" },
                    { icon: Layers, title: "Background", desc: "Store project context", section: "background" },
                    { icon: Brain, title: "AI Templates", desc: "Generate documents from templates", section: "hub" },
                  ].map((item, i) => (
                    <Card
                      key={i}
                      className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm cursor-pointer group hover:scale-105"
                      onClick={() => setActiveSection(item.section)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 text-gray-900 text-center">{item.title}</h3>
                      <p className="text-sm text-gray-600 text-center">{item.desc}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hub Section */}
          {activeSection === "hub" && !viewingArtifact && (
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Content Hub
                </h2>
                <p className="text-gray-600">Manage your AI-generated artifacts and templates</p>
              </div>

              {/* Your Artifacts */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    YOUR ARTIFACTS
                  </h3>
                  <Button
                    onClick={() => setShowTemplates(true)}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Artifact
                  </Button>
                </div>

                {artifacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {artifacts.map((artifact) => {
                      const template = TEMPLATES.find(t => t.type === artifact.type)
                      const IconComponent = template?.icon || FileText
                      return (
                        <Card
                          key={artifact.id}
                          className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200 bg-white"
                          onClick={() => setViewingArtifact(artifact)}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">{artifact.title}</h4>
                                <p className="text-xs text-gray-500">{artifact.createdAt.toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs self-start bg-blue-50 text-blue-700">
                              {artifact.type.toUpperCase()}
                            </Badge>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="p-12 text-center border-dashed border-2 border-gray-200">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No artifacts yet</h3>
                    <p className="text-gray-600 mb-4">Create your first artifact using our templates</p>
                    <Button onClick={() => setShowTemplates(true)} className="bg-blue-600 hover:bg-blue-700">
                      Get Started
                    </Button>
                  </Card>
                )}
              </div>

              {/* Integration Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  INTEGRATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border border-blue-200 bg-white">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-3">
                        <span className="text-white font-bold text-lg">J</span>
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">JIRA</h4>
                      <p className="text-xs text-blue-600">Integration</p>
                    </div>
                  </Card>
                  <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border border-blue-200 bg-white">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-3">
                        <span className="text-white font-bold text-lg">T</span>
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">TRELLO</h4>
                      <p className="text-xs text-blue-600">Integration</p>
                    </div>
                  </Card>
                  <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border border-gray-200 bg-gray-50">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center mb-3">
                        <span className="text-gray-600 text-sm">+</span>
                      </div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">More</h4>
                      <p className="text-xs text-gray-400">Coming Soon!</p>
                    </div>
                  </Card>
                </div>

                {/* Templates Section */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" />
                  TEMPLATES
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TEMPLATES.slice(0, 6).map((template) => (
                    <Card
                      key={template.id}
                      className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200 bg-white"
                      onClick={() => createArtifactFromTemplate(template)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                          <template.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{template.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Artifact Viewer */}
          {activeSection === "hub" && viewingArtifact && (
            <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-12rem)] min-h-[500px]">
              <ResizablePanel defaultSize={70} minSize={50}>
                <div className="flex flex-col h-full pr-4">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setViewingArtifact(null)}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Hub
                    </Button>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {viewingArtifact.type.toUpperCase()}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  <Card className="flex-1 p-6 overflow-hidden">
                    <div className="mb-4">
                      <Input
                        value={viewingArtifact.title}
                        onChange={(e) => updateArtifact({ title: e.target.value })}
                        className="text-xl font-semibold border-none px-0 focus:ring-0"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {viewingArtifact.createdAt.toLocaleDateString()} • 
                        Updated: {viewingArtifact.updatedAt.toLocaleDateString()}
                      </p>
                    </div>

                    <ScrollArea className="h-[calc(100%-6rem)]">
                      <div className="prose prose-sm max-w-none">
                        <Textarea
                          value={viewingArtifact.content}
                          onChange={(e) => updateArtifact({ content: e.target.value })}
                          className="min-h-[400px] border-none resize-none focus:ring-0 font-mono text-sm"
                        />
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel defaultSize={30} minSize={25} maxSize={45}>
                <div className="flex flex-col h-full pl-4">
                  <Card className="bg-white/70 backdrop-blur-sm border-blue-100 overflow-hidden flex-1 flex flex-col">
                    <div className="p-4 border-b border-blue-100 bg-white/50">
                      <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Neura - Product Manager
                      </h3>
                      <p className="text-xs text-blue-600">Ask for suggestions or request edits</p>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {artifactMessages.length === 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-900 mb-2">Hi! I can help you with:</p>
                            <ul className="text-xs text-blue-700 space-y-1">
                              <li>• Suggest improvements to your content</li>
                              <li>• Help you rewrite sections</li>
                              <li>• Add missing information</li>
                              <li>• Optimize for clarity and impact</li>
                            </ul>
                          </div>
                        )}

                        {artifactMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`${message.role === "user" ? "ml-4" : "mr-4"}`}
                          >
                            <div className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                              <div className="flex-shrink-0">
                                {message.role === "user" ? (
                                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                    <User className="w-3 h-3 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Brain className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className={`flex-1 ${message.role === "user" ? "text-right" : "text-left"}`}>
                                <div className={`inline-block p-2 rounded-lg text-xs ${
                                  message.role === "user" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-100 text-gray-900"
                                }`}>
                                  <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {isArtifactLoading && (
                          <div className="flex items-center gap-2 text-xs text-blue-600">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Neura is thinking...
                          </div>
                        )}
                        <div ref={artifactMessagesEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-blue-100 bg-white/50">
                      <div className="relative">
                        <Textarea
                          value={artifactInput}
                          onChange={(e) => setArtifactInput(e.target.value)}
                          placeholder="Ask Neura for suggestions..."
                          className="min-h-[60px] max-h-24 resize-none border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-white text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage(artifactInput, true)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => sendMessage(artifactInput, true)}
                          disabled={!artifactInput.trim() || isArtifactLoading}
                          className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded"
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}

          {/* Chat Section */}
          {activeSection === "chat" && (
            <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Chat with Neura
                </h2>
                <p className="text-gray-600">Your AI Product Manager assistant</p>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm border-blue-100 overflow-hidden h-[calc(100%-6rem)] flex flex-col">
                <div className="p-4 border-b border-blue-100 bg-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Neura</h3>
                      <p className="text-xs text-blue-600">Product Manager • Online</p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-900 mb-3">
                          <strong>Neura:</strong> Hi! I'm your AI Product Manager. I can help you with:
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Create an OKR from your PRD</li>
                          <li>• Generate product roadmaps</li>
                          <li>• Define user personas</li>
                          <li>• Draft product requirements</li>
                          <li>• Analyze market opportunities</li>
                        </ul>
                        <p className="text-xs text-blue-600 mt-3">
                          Try: "... an OKR from this PRD" or "... a roadmap for Q1"
                        </p>
                      </div>
                    )}

                    {messages.map((message, index) => (
                      <div key={index} className={`${message.role === "user" ? "ml-8" : "mr-8"}`}>
                        <div className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                          <div className="flex-shrink-0">
                            {message.role === "user" ? (
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <Brain className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className={`flex-1 ${message.role === "user" ? "text-right" : "text-left"}`}>
                            <div className="text-xs text-gray-500 mb-1">
                              {message.role === "user" ? "You" : "Neura"} • {message.timestamp.toLocaleTimeString()}
                            </div>
                            <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                              message.role === "user" 
                                ? "bg-blue-600 text-white" 
                                : "bg-white border border-gray-200"
                            }`}>
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                              </div>
                              {message.attachedFile && (
                                <div className="mt-2 text-xs flex items-center gap-1 opacity-75">
                                  <Paperclip className="w-3 h-3" />
                                  {message.attachedFile.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex items-center gap-2 text-blue-600 mr-8">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Neura is thinking...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-blue-100 bg-white/50">
                  <div className="relative">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask Neura anything about product management..."
                      className="min-h-[80px] max-h-32 resize-none border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20 bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage(input)
                        }
                      }}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                        onClick={() => chatFileInputRef.current?.click()}
                      >
                        <Paperclip className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <input
                    ref={chatFileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "chat")
                    }}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Background Section */}
          {activeSection === "background" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Background Information
                </h2>
                <p className="text-gray-600">Provide context for better AI responses and document generation</p>
              </div>

              <Card className="p-6 border-0 bg-white/70 backdrop-blur-sm border-blue-100">
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Upload Background File</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        className="bg-white border-blue-200 hover:bg-blue-50"
                        onClick={() => backgroundFileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose PDF or TXT file
                      </Button>
                      {backgroundFileName && <span className="text-sm text-gray-600">{backgroundFileName}</span>}
                    </div>
                    <input
                      ref={backgroundFileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "background")
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Background Text</Label>
                    <Textarea
                      value={backgroundText || ""}
                      onChange={(e) => setBackgroundText(e.target.value)}
                      placeholder="Describe your company, product, target users, business goals, or any context that will help Neura provide better assistance..."
                      className="min-h-[200px] border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  <Button onClick={saveBackground} className="w-full bg-blue-600 hover:bg-blue-700">
                    Save Background Information
                  </Button>
                </div>
              </Card>

              {(backgroundInfo.file || backgroundInfo.text) && (
                <Card className="p-6 border-0 bg-white/70 backdrop-blur-sm border-blue-100">
                  <h3 className="font-semibold mb-4 text-gray-900">Current Background</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    {backgroundInfo.file && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2 text-blue-900">File Content:</h4>
                        <p className="text-sm text-blue-700 whitespace-pre-wrap">
                          {backgroundInfo.file.substring(0, 500)}...
                        </p>
                      </div>
                    )}
                    {backgroundInfo.text && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 text-blue-900">Text Content:</h4>
                        <p className="text-sm text-blue-700 whitespace-pre-wrap">{backgroundInfo.text}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Template Selection Modal */}
      {showTemplates && (
        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Choose Template
              </DialogTitle>
              <DialogDescription>
                Select a template to create a new artifact. AI will fill it with relevant content based on your background information.
              </DialogDescription>
            </DialogHeader>

            <div className="mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
                    onClick={() => createArtifactFromTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <template.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                          {template.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplates(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}