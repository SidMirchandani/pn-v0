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
  Eye,
  Edit2,
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

const API_KEY = "AIzaSyC4v647dYrneDbR2K5BJwJ4sbvq43fZtRc"
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

interface Message {
  role: "user" | "model" | "system"
  parts: { text: string }[]
  timestamp: Date
  attachedFile?: { name: string; url: string; type: string }
}

interface SavedContent {
  id: string
  title: string
  content: string
  type: "roadmap" | "okr" | "persona" | "plan" | "timeline" | "prd" | "strategy" | "other"
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface Template {
  id: string
  title: string
  description: string
  type: SavedContent['type']
  icon: any
  color: string
  template: string
}

const TEMPLATES: Template[] = [
  {
    id: "prd",
    title: "Product Requirements Document",
    description: "Comprehensive product specification and requirements",
    type: "prd",
    icon: FileText,
    color: "#3B82F6",
    template: `# Product Requirements Document

## 1. Overview
Brief description of the product and its purpose.

## 2. Goals & Objectives
- Primary goal
- Secondary goals
- Success metrics

## 3. User Stories
- As a [user type], I want [goal] so that [benefit]

## 4. Features & Requirements
### Core Features
- Feature 1: Description
- Feature 2: Description

### Technical Requirements
- Performance requirements
- Security requirements
- Compatibility requirements

## 5. Timeline
- Phase 1: [Timeline]
- Phase 2: [Timeline]

## 6. Success Metrics
How will we measure success?`
  },
  {
    id: "okr",
    title: "OKR (Objectives & Key Results)",
    description: "Goal-setting framework for teams and individuals",
    type: "okr",
    icon: Target,
    color: "#10B981",
    template: `# OKR: [Quarter/Period]

## Objective: [Clear, inspiring goal]

### Key Results:
1. [Measurable result 1] - Target: [specific metric]
2. [Measurable result 2] - Target: [specific metric]  
3. [Measurable result 3] - Target: [specific metric]

## Initiatives:
- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

## Success Criteria:
How we'll know we've achieved this objective.`
  },
  {
    id: "roadmap",
    title: "Product Roadmap",
    description: "Strategic plan for product development",
    type: "roadmap",
    icon: Code,
    color: "#8B5CF6",
    template: `# Product Roadmap: [Product Name]

## Vision
[Product vision statement]

## Q1 Goals
### Epic 1: [Name]
- Feature A
- Feature B
- Feature C

### Epic 2: [Name]
- Feature D
- Feature E

## Q2 Goals
### Epic 3: [Name]
- Feature F
- Feature G

## Q3-Q4 Future Considerations
- [Future feature/epic]
- [Research areas]

## Success Metrics
- [Metric 1]
- [Metric 2]`
  },
  {
    id: "persona",
    title: "User Persona",
    description: "Detailed user profile and characteristics",
    type: "persona",
    icon: User,
    color: "#F59E0B",
    template: `# User Persona: [Persona Name]

## Demographics
- **Age:** [Age range]
- **Location:** [Geographic location]
- **Occupation:** [Job title/role]
- **Income:** [Income range]

## Background
[Brief background story]

## Goals & Motivations
- Primary goal: [What they want to achieve]
- Secondary goals: [Additional objectives]
- Motivations: [What drives them]

## Pain Points
- [Pain point 1]
- [Pain point 2]
- [Pain point 3]

## Technology Comfort
- [Tech savviness level]
- [Preferred devices/platforms]

## How [Product] Helps
[How your product addresses their needs]`
  },
  {
    id: "strategy",
    title: "Go-to-Market Strategy",
    description: "Plan for bringing product to market",
    type: "strategy",
    icon: Sparkles,
    color: "#EC4899",
    template: `# Go-to-Market Strategy: [Product Name]

## Product Overview
[Brief product description]

## Target Market
### Primary Audience
- [Target segment 1]
- [Target segment 2]

### Market Size
- TAM: [Total Addressable Market]
- SAM: [Serviceable Addressable Market]
- SOM: [Serviceable Obtainable Market]

## Value Proposition
[Clear value proposition statement]

## Pricing Strategy
- [Pricing model]
- [Price points]
- [Competitive positioning]

## Marketing Channels
1. [Channel 1] - [Strategy]
2. [Channel 2] - [Strategy]
3. [Channel 3] - [Strategy]

## Launch Plan
### Pre-launch (Weeks -4 to 0)
- [ ] [Task 1]
- [ ] [Task 2]

### Launch (Week 0-2)
- [ ] [Task 1]
- [ ] [Task 2]

### Post-launch (Week 2+)
- [ ] [Task 1]
- [ ] [Task 2]

## Success Metrics
- [KPI 1]
- [KPI 2]`
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
  const [savedContent, setSavedContent] = useState<SavedContent[]>([])
  const [viewingContent, setViewingContent] = useState<SavedContent | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateSearch, setTemplateSearch] = useState("")
  const [documentMessages, setDocumentMessages] = useState<Message[]>([])
  const [documentInput, setDocumentInput] = useState("")
  const [isDocumentLoading, setIsDocumentLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [pendingEdit, setPendingEdit] = useState<{ content: string; suggestion: string } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatFileInputRef = useRef<HTMLInputElement>(null)
  const backgroundFileInputRef = useRef<HTMLInputElement>(null)
  const documentMessagesEndRef = useRef<HTMLDivElement>(null)
  const documentFileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollDocumentToBottom = () => {
    documentMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    scrollDocumentToBottom()
  }, [documentMessages])

  const getBackgroundPrompt = useCallback(() => {
    let prompt = ""
    if (backgroundInfo.file) prompt += backgroundInfo.file + "\n"
    if (backgroundInfo.text) prompt += backgroundInfo.text + "\n"
    return prompt.trim()
  }, [backgroundInfo.file, backgroundInfo.text])

  const sendApiRequest = async (prompt: string, messageHistory: Message[], isDocument = false) => {
    try {
      const contextParts: string[] = []
      contextParts.push("You are Neura, a Product Manager AI assistant.")

      const backgroundPrompt = getBackgroundPrompt()
      if (backgroundPrompt) {
        contextParts.push("[Background Information]\n" + backgroundPrompt)
      }

      contextParts.push(
        "INSTRUCTION: Always answer as Neura (Product Manager). Start your answer with 'Neura: ' and focus on product management expertise. Use the background information provided to give contextual and relevant responses."
      )

      const apiHistory = messageHistory
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
        aiResponse = "Neura: I didn't receive any content. Please rephrase or try again later."
      }

      const aiMessage: Message = {
        role: "model",
        parts: [{ text: aiResponse }],
        timestamp: new Date(),
      }

      if (isDocument) {
        setDocumentMessages((prev) => [...prev, aiMessage])
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

      if (isDocument) {
        setDocumentMessages((prev) => [...prev, errorMsg])
      } else {
        setMessages((prev) => [...prev, errorMsg])
      }
    } finally {
      if (isDocument) {
        setIsDocumentLoading(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  const sendMessage = async (messageContent: string, isDocument = false) => {
    if (!messageContent.trim() || (isDocument ? isDocumentLoading : isLoading)) return

    const userMessage: Message = {
      role: "user",
      parts: [{ text: messageContent }],
      timestamp: new Date(),
    }

    if (isDocument) {
      setDocumentMessages((prev) => [...prev, userMessage])
      setDocumentInput("")
      setIsDocumentLoading(true)
      await sendApiRequest(messageContent, [...documentMessages, userMessage], true)
    } else {
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)
      await sendApiRequest(messageContent, [...messages, userMessage], false)
    }
  }

  const handleFileUpload = async (file: File, type: "background" | "chat" | "document") => {
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
      } else if (type === "document") {
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
        setDocumentMessages((prev) => [...prev, userMessage])
        setDocumentInput("")
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

  const createArtifact = async (template: Template) => {
    const backgroundPrompt = getBackgroundPrompt()
    if (!backgroundPrompt) {
      alert("Please add background information first before creating artifacts.")
      setActiveSection("background")
      return
    }

    setIsLoading(true)
    try {
      const prompt = `Based on the background information provided, create a ${template.title} using this template:

${template.template}

Fill in all the placeholders with relevant information based on the background context. Make it detailed and actionable.`

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `[Background Information]\n${backgroundPrompt}\n\n${prompt}` }] }
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
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || template.template

      const newArtifact: SavedContent = {
        id: Date.now().toString(),
        title: template.title,
        content,
        type: template.type,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [template.type]
      }

      setSavedContent(prev => [newArtifact, ...prev])
      setShowTemplates(false)
      setViewingContent(newArtifact)
    } catch (error) {
      console.error("Error creating artifact:", error)
      alert("Error creating artifact. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateArtifactContent = (newContent: string) => {
    if (!viewingContent) return

    const updatedContent = {
      ...viewingContent,
      content: newContent,
      updatedAt: new Date()
    }

    setViewingContent(updatedContent)
    setSavedContent(prev => prev.map(item => 
      item.id === viewingContent.id ? updatedContent : item
    ))
  }

  const applyEdit = () => {
    if (pendingEdit && viewingContent) {
      updateArtifactContent(pendingEdit.content)
      setPendingEdit(null)
    }
  }

  const filteredTemplates = TEMPLATES.filter(template =>
    template.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
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
      className="w-10 h-10 p-0 hover:bg-blue-50 group"
      onClick={onClick}
      title={label}
    >
      <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
    </Button>
  )

  const renderMessage = (message: Message, index: number, isDocument = false) => {
    const isUser = message.role === "user"
    const content = message.parts[0].text

    return (
      <div key={index} className={`group mb-4 ${isUser ? "mr-4" : "ml-4"}`}>
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <div className="flex-shrink-0">
            {isUser ? (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-blue-600">
                <Brain className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className={`flex-1 min-w-0 ${isUser ? "max-w-[calc(100%-4rem)] ml-auto" : "max-w-[calc(100%-4rem)] mr-auto"}`}>
            <div className={`flex items-center gap-2 mb-1 ${isUser ? "justify-end" : "justify-start"}`}>
              <span className="text-sm font-medium text-gray-900">{isUser ? "You" : "Neura"}</span>
              {!isUser && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  Product Manager
                </Badge>
              )}
              <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
            </div>

            <div className={`${isUser ? "text-right" : "text-left"}`}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PN</span>
              </div>
              <span className="font-semibold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ProductNow
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NavButton icon={Home} label="Home" section="home" isActive={activeSection === "home"} />
              <NavButton icon={FileText} label="Hub" section="hub" isActive={activeSection === "hub"} />
              <NavButton icon={Layers} label="Background" section="background" isActive={activeSection === "background"} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Home Section */}
        {activeSection === "home" && (
          <div className="text-center py-20">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                ProductNow
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Your vision. AI that builds with you—from idea to launch. Streamline product development with
                intelligent agents.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                {[
                  {
                    icon: FileText,
                    title: "Content Hub",
                    desc: "View and edit AI-generated artifacts",
                    color: "from-blue-500 to-blue-600",
                  },
                  {
                    icon: Layers,
                    title: "Background",
                    desc: "Store project context and information",
                    color: "from-indigo-500 to-indigo-600",
                  },
                  {
                    icon: Brain,
                    title: "AI Assistant",
                    desc: "Neura helps with product management",
                    color: "from-purple-500 to-purple-600",
                  },
                  {
                    icon: Sparkles,
                    title: "Templates",
                    desc: "Ready-to-use document templates",
                    color: "from-cyan-500 to-cyan-600",
                  },
                ].map((item, i) => (
                  <Card
                    key={i}
                    className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm cursor-pointer group hover:scale-105"
                    onClick={() => setActiveSection("hub")}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                    >
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
        {activeSection === "hub" && !viewingContent && (
          <div className="flex">
            {/* Quick Access Sidebar */}
            <div className="w-16 mr-4 space-y-2">
              <SidebarButton icon={Clock} label="Previous Chats" onClick={() => setShowSidebar(!showSidebar)} />
              <SidebarButton icon={Layers} label="Background Context" onClick={() => setActiveSection("background")} />
              <SidebarButton icon={Settings} label="Settings" onClick={() => {}} />
              <SidebarButton icon={HelpCircle} label="Help" onClick={() => {}} />
            </div>

            <div className="flex-1 p-4">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Content Hub
                </h2>
                <p className="text-gray-600">All your AI-generated artifacts in one place</p>
              </div>

              {/* Your Artifacts Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    YOUR ARTIFACTS
                  </h3>
                  <Button
                    onClick={() => setShowTemplates(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Artifact
                  </Button>
                </div>

                {savedContent.length === 0 ? (
                  <Card className="p-8 text-center border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No artifacts yet</h4>
                    <p className="text-gray-600 mb-4">Create your first artifact using our templates</p>
                    <Button
                      onClick={() => setShowTemplates(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Browse Templates
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {savedContent.map((item) => {
                      const template = TEMPLATES.find(t => t.type === item.type) || TEMPLATES[0]
                      return (
                        <Card 
                          key={item.id} 
                          className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200 bg-white"
                          onClick={() => setViewingContent(item)}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                              style={{ backgroundColor: template.color }}
                            >
                              <template.icon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-medium text-sm text-gray-900 mb-1">{item.title}</h4>
                            <Badge
                              variant="secondary"
                              className="text-xs mb-2"
                              style={{ backgroundColor: template.color + "20", color: template.color }}
                            >
                              {item.type.toUpperCase()}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {item.updatedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Templates Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <File className="w-5 h-5 text-blue-600" />
                  TEMPLATES
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TEMPLATES.slice(0, 3).map((template) => (
                    <Card 
                      key={template.id}
                      className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200 bg-white"
                      onClick={() => createArtifact(template)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: template.color }}
                        >
                          <template.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900">{template.title}</h4>
                          <p className="text-xs text-gray-600">{template.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplates(true)}
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    View All Templates
                  </Button>
                </div>
              </div>

              {/* Integration Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  INTEGRATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </div>
          </div>
        )}

        {/* Document View */}
        {activeSection === "hub" && viewingContent && (
          <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-12rem)] min-h-[500px]">
            <ResizablePanel defaultSize={70} minSize={50}>
              <div className="flex flex-col h-full p-4 pr-2">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => setViewingContent(null)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Hub
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <Card className="flex-1 p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{viewingContent.title}</h1>
                    <Badge variant="secondary" className="text-xs">
                      {viewingContent.type.toUpperCase()}
                    </Badge>
                  </div>

                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{viewingContent.content}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
              <div className="flex flex-col h-full p-4 pl-2">
                <Card className="bg-white/70 backdrop-blur-sm border-blue-100 overflow-hidden flex-1 flex flex-col">
                  {/* Neura Chat Header */}
                  <div className="p-4 border-b border-blue-100 bg-white/50">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Neura Assistant
                    </h3>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-blue-600">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-900">Neura</div>
                        <div className="text-xs text-blue-600">Product Manager • Ready to help</div>
                      </div>
                    </div>
                  </div>

                  {/* Document Chat Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {documentMessages.length === 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-900 mb-2">Hi! I can help you with this document:</p>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Suggest improvements</li>
                            <li>• Add missing sections</li>
                            <li>• Refine content based on context</li>
                            <li>• Answer questions about best practices</li>
                          </ul>
                        </div>
                      )}
                      {documentMessages.map((message, index) => renderMessage(message, index, true))}
                    </div>
                    <div ref={documentMessagesEndRef} />
                  </ScrollArea>

                  {/* Pending Edit Approval */}
                  {pendingEdit && (
                    <div className="p-4 border-t border-yellow-200 bg-yellow-50">
                      <p className="text-sm text-yellow-800 mb-2">Neura suggests an edit:</p>
                      <p className="text-xs text-yellow-700 mb-3">{pendingEdit.suggestion}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={applyEdit} className="bg-green-600 hover:bg-green-700">
                          Apply
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setPendingEdit(null)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Document Chat Input */}
                  <div className="p-4 border-t border-blue-100 bg-white/50">
                    <div className="relative">
                      <Textarea
                        value={documentInput}
                        onChange={(e) => setDocumentInput(e.target.value)}
                        placeholder="Ask Neura about this document..."
                        className="min-h-[40px] max-h-24 resize-none border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20 bg-white text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage(documentInput, true)
                          }
                        }}
                      />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-blue-100"
                          onClick={() => documentFileInputRef.current?.click()}
                        >
                          <Paperclip className="w-3 h-3 text-gray-500" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-6 w-6 p-0 bg-blue-600 hover:bg-blue-700 rounded"
                          onClick={() => sendMessage(documentInput, true)}
                          disabled={isDocumentLoading || !documentInput.trim()}
                        >
                          {isDocumentLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <input
                        ref={documentFileInputRef}
                        type="file"
                        accept=".pdf,.txt,.md"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "document")
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {/* Background Section */}
        {activeSection === "background" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Background Information
              </h2>
              <p className="text-gray-600">Provide context for better AI responses</p>
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
                    placeholder="Describe your company, product, or any context the AI should know..."
                    className="min-h-[150px] border-blue-200 focus:ring-blue-500"
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

      {/* Template Selection Modal */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Choose a Template
            </DialogTitle>
            <DialogDescription>
              Select a template to create your artifact. Search to find the perfect template for your needs.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="p-4 hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
                  onClick={() => createArtifact(template)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: template.color }}
                    >
                      <template.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 mb-1">{template.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: template.color + "20", color: template.color }}
                      >
                        {template.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}