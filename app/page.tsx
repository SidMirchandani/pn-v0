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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  agent?: keyof typeof AGENTS // Only for 'model' role
  timestamp: Date
  attachedFile?: { name: string; url: string; type: string } // New field for attached file info
}

const AGENTS = {
  Neura: {
    name: "Neura",
    role: "Product Manager",
    color: "#3B82F6", // Blue
    icon: Brain,
    description: "Strategic product decisions and roadmaps",
  },
  Mira: {
    name: "Mira",
    role: "Marketing Manager",
    color: "#F59E0B", // Orange
    icon: Sparkles,
    description: "Go-to-market and growth strategies",
  },
  Secura: {
    name: "Secura",
    role: "Cybersecurity",
    color: "#10B981", // Green
    icon: Shield,
    description: "Security architecture and compliance",
  },
  Jett: {
    name: "Jett",
    role: "Program Manager",
    color: "#8B5CF6", // Purple
    icon: Zap,
    description: "Project coordination and delivery",
  },
  Atlas: {
    name: "Atlas",
    role: "Architect",
    color: "#06B6D4", // Cyan
    icon: Layers,
    description: "System design and technical architecture",
  },
  Prism: {
    name: "Prism",
    role: "Full Stack Designer",
    color: "#EC4899", // Pink
    icon: Palette,
    description: "UI/UX design and user experience",
  },
  Forge: {
    name: "Forge",
    role: "Developer",
    color: "#EF4444", // Red
    icon: Code,
    description: "Implementation and technical solutions",
  },
}

const AGENT_ROLE_CONTEXT = `Agents and Roles:
Neura: virtual Product Manager
Mira: v-Marketing Manager
Secura: v-Cybersecurity
Jett: v-Program Manager
Atlas: v-Architect
Prism: v-Full stack designers
Forge: v-developer`

const QUICK_COMMANDS = [
  {
    agent: "Neura",
    command: "Generate a product roadmap for Async Voice Notes",
    description: "Create a strategic roadmap for the product",
    example: "Neura, generate a product roadmap for Async Voice Notes for the next 6 months.",
  },
  {
    agent: "Neura",
    command: "Define user personas for Async Voice Notes",
    description: "Outline target user profiles and their needs",
    example: "Neura, define 3 key user personas for Async Voice Notes.",
  },
  {
    agent: "Mira",
    command: "Draft a go-to-market strategy for Async Voice Notes",
    description: "Develop a plan for product launch and promotion",
    example: "Mira, draft a go-to-market strategy for Async Voice Notes targeting productivity enthusiasts.",
  },
  {
    agent: "Mira",
    command: "Suggest marketing channels for Async Voice Notes",
    description: "Identify effective channels for reaching target audience",
    example: "Mira, suggest top 5 marketing channels for Async Voice Notes.",
  },
  {
    agent: "Secura",
    command: "Outline security best practices for voice data",
    description: "Provide guidelines for protecting sensitive voice recordings",
    example: "Secura, outline security best practices for handling voice data in Async Voice Notes.",
  },
  {
    agent: "Secura",
    command: "Perform a threat model for Async Voice Notes",
    description: "Identify potential security threats and vulnerabilities",
    example: "Secura, perform a threat model for the Async Voice Notes application.",
  },
  {
    agent: "Jett",
    command: "Turn this PRD into linked Jira workitems",
    description: "Create structured work items from product requirements",
    example: "Jett, turn the mobile app PRD into linked Jira workitems with proper dependencies",
  },
  {
    agent: "Jett",
    command: "Show me all use cases tied to PRD XYZ",
    description: "Retrieve and display related work items",
    example: "Jett, show me all use cases tied to the authentication system PRD",
  },
  {
    agent: "Jett",
    command: "Add the XYZ feature to all open workitems",
    description: "Bulk update multiple work items",
    example: "Jett, add the dark mode feature to all open UI workitems",
  },
  {
    agent: "Jett",
    command: "Remove deprecated tasks from this initiative",
    description: "Clean up outdated work items",
    example: "Jett, remove deprecated OAuth 1.0 tasks from the authentication initiative",
  },
  {
    agent: "Jett",
    command: "Create sprint from backlog items tagged 'urgent'",
    description: "Generate sprints based on criteria",
    example: "Jett, create a 2-week sprint from backlog items tagged 'urgent' and 'bug'",
  },
  {
    agent: "Jett",
    command: "Generate test cases for feature XYZ",
    description: "Auto-create testing work items",
    example: "Jett, generate test cases for the payment processing feature",
  },
  {
    agent: "Jett",
    command: "Link all frontend tasks to design system epic",
    description: "Create relationships between work items",
    example: "Jett, link all frontend tasks to the design system epic for better tracking",
  },
  {
    agent: "Jett",
    command: "Estimate story points for backlog using similar completed work",
    description: "AI-powered estimation based on historical data",
    example: "Jett, estimate story points for the user profile backlog using similar completed work",
  },
  {
    agent: "Atlas",
    command: "Design the database schema for Async Voice Notes",
    description: "Create a database structure for the application",
    example: "Atlas, design the database schema for Async Voice Notes, considering scalability.",
  },
  {
    agent: "Atlas",
    command: "Propose a microservices architecture for Async Voice Notes",
    description: "Suggest a scalable and modular system design",
    example: "Atlas, propose a microservices architecture for Async Voice Notes.",
  },
  {
    agent: "Prism",
    command: "Create wireframes for the Async Voice Notes mobile app",
    description: "Design low-fidelity layouts for the mobile application",
    example: "Prism, create wireframes for the Async Voice Notes mobile app's recording screen.",
  },
  {
    agent: "Prism",
    command: "Develop a UI style guide for Async Voice Notes",
    description: "Establish visual design principles and components",
    example: "Prism, develop a UI style guide for Async Voice Notes, focusing on a clean aesthetic.",
  },
  {
    agent: "Forge",
    command: "Write a code snippet for audio recording in React Native",
    description: "Provide example code for implementing audio recording",
    example: "Forge, write a code snippet for audio recording in React Native.",
  },
  {
    agent: "Forge",
    command: "Debug a common API integration issue",
    description: "Help troubleshoot API connectivity problems",
    example: "Forge, help me debug a common API integration issue with a third-party service.",
  },
]

export default function ProductNow() {
  const [activeSection, setActiveSection] = useState("home")
  const [selectedAgent, setSelectedAgent] = useState<keyof typeof AGENTS>("Neura")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [okrContent, setOkrContent] = useState("")
  const [okrExtra, setOkrExtra] = useState("")
  const [okrFileContent, setOkrFileContent] = useState<string | null>(null)
  const [okrFileName, setOkrFileName] = useState<string | null>(null)
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
  const [editingMessage, setEditingMessage] = useState<{ index: number; text: string } | null>(null)
  const [interactionPopup, setInteractionPopup] = useState<{
    open: boolean
    message: string
    type: "jira" | "agent" | "edit" | "document" | null
  } | null>(null)
  const [documentPopup, setDocumentPopup] = useState<{ open: boolean; title: string; content: string } | null>(null)
  const [messageEditHistory, setMessageEditHistory] = useState<{ [key: number]: string[] }>({})
  const [currentEditIndex, setCurrentEditIndex] = useState<{ [key: number]: number }>({})
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null)
  const [agentMode, setAgentMode] = useState<"auto" | "custom">("auto")
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundFileInputRef = useRef<HTMLInputElement>(null)
  const chatFileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with default OKR prompt if no content
  useEffect(() => {
    if (!okrContent) {
      setOkrContent(`OBJECTIVE: Launch and grow Async Voice Notes for Product Hunt

Key Results:
- Achieve 1,000 monthly active users for Async Voice Notes within 3 months
- Secure 10+ product reviews and testimonials from the Product Hunt community
- Integrate voice notes with at least 2 popular productivity tools
- Maintain a user satisfaction score of 90%+ during the launch period`)
    }
  }, [okrContent])

  const getBackgroundPrompt = useCallback(() => {
    let prompt = ""
    if (backgroundInfo.file) prompt += backgroundInfo.file + "\n"
    if (backgroundInfo.text) prompt += backgroundInfo.text + "\n"
    return prompt.trim()
  }, [backgroundInfo.file, backgroundInfo.text])

  const getAutoAgent = useCallback((prompt: string): keyof typeof AGENTS => {
    const lowerPrompt = prompt.toLowerCase()

    if (
      lowerPrompt.includes("roadmap") ||
      lowerPrompt.includes("strategy") ||
      lowerPrompt.includes("product") ||
      lowerPrompt.includes("feature") ||
      lowerPrompt.includes("define persona")
    ) {
      return "Neura"
    } else if (
      lowerPrompt.includes("marketing") ||
      lowerPrompt.includes("campaign") ||
      lowerPrompt.includes("growth") ||
      lowerPrompt.includes("go-to-market") ||
      lowerPrompt.includes("marketing channels")
    ) {
      return "Mira"
    } else if (
      lowerPrompt.includes("security") ||
      lowerPrompt.includes("threat") ||
      lowerPrompt.includes("vulnerability") ||
      lowerPrompt.includes("compliance") ||
      lowerPrompt.includes("best practices")
    ) {
      return "Secura"
    } else if (
      lowerPrompt.includes("jira") ||
      lowerPrompt.includes("project") ||
      lowerPrompt.includes("sprint") ||
      lowerPrompt.includes("task") ||
      lowerPrompt.includes("workitems")
    ) {
      return "Jett"
    } else if (
      lowerPrompt.includes("architecture") ||
      lowerPrompt.includes("database") ||
      lowerPrompt.includes("system design") ||
      lowerPrompt.includes("schema") ||
      lowerPrompt.includes("microservices")
    ) {
      return "Atlas"
    } else if (
      lowerPrompt.includes("design") ||
      lowerPrompt.includes("ui") ||
      lowerPrompt.includes("ux") ||
      lowerPrompt.includes("wireframe") ||
      lowerPrompt.includes("style guide")
    ) {
      return "Prism"
    } else if (
      lowerPrompt.includes("code") ||
      lowerPrompt.includes("debug") ||
      lowerPrompt.includes("api") ||
      lowerPrompt.includes("implementation") ||
      lowerPrompt.includes("develop")
    ) {
      return "Forge"
    }

    return "Neura" // Default fallback
  }, [])

  const processSpecialCommands = (message: string) => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("jira")) {
      setInteractionPopup({ open: true, message: "Referring to Jira Information...", type: "jira" })
      setTimeout(() => {
        setInteractionPopup(null)
        const jiraResponse =
          "Jett: I've accessed the Jira system. What specific information or action are you looking for regarding Jira?"
        const jiraMessage: Message = {
          role: "model",
          parts: [{ text: jiraResponse }],
          agent: "Jett",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, jiraMessage])
      }, 1500)
      return true
    }

    if (
      lowerMessage.includes("create doc") ||
      lowerMessage.includes("generate doc") ||
      lowerMessage.includes("write document")
    ) {
      setInteractionPopup({ open: true, message: "Generating document...", type: "document" })
      setTimeout(() => {
        setInteractionPopup(null)
        const docTitle = "Sample Product Requirements Document"
        const docContent = `## ${docTitle}

### 1. Introduction
This document outlines the requirements for the **Async Voice Notes** feature.

### 2. Goals
- Enable users to record and share voice notes easily.
- Improve asynchronous communication within teams.

### 3. Features
- **Voice Recording**: High-quality audio capture.
- **Playback**: Seamless playback of recorded notes.
- **Sharing**: Share notes via link or direct message.
- **Transcription (Optional)**: Convert voice to text.

### 4. User Stories
- As a user, I want to record a voice note so I can quickly share updates.
- As a team member, I want to listen to voice notes so I can get context without a live meeting.

### 5. Technical Considerations
- Cloud storage for audio files.
- API for recording and playback.

### 6. Future Enhancements
- Integration with calendar tools.
- Advanced search for voice notes.
`
        setDocumentPopup({ open: true, title: docTitle, content: docContent })
      }, 2000)
      return true
    }

    return false
  }

  const sendApiRequest = async (
    agentForAPI: keyof typeof AGENTS,
    apiPromptText: string,
    messagesHistoryForAPI: Message[],
  ) => {
    try {
      const contextParts: string[] = []
      contextParts.push(AGENT_ROLE_CONTEXT)

      const backgroundPrompt = getBackgroundPrompt()
      if (backgroundPrompt) {
        contextParts.push("[Background Information]\n" + backgroundPrompt)
      }

      // Add instruction for the specific agent's persona
      contextParts.push(
        `INSTRUCTION: Always answer as ${agentForAPI} (${AGENTS[agentForAPI].role}). Start your answer with "${AGENTS[agentForAPI].name}: " and focus on your area of expertise. Use the background information provided to give contextual and relevant responses.`,
      )

      // Only include actual user/model messages in API history, excluding system messages and attachedFile info
      const apiHistory = messagesHistoryForAPI
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

        if (!aiResponse && typeof (content as any).text === "string") {
          aiResponse = (content as any).text
        }

        if (!aiResponse && Array.isArray(content)) {
          aiResponse = (content as any[])
            .map((p) => (typeof p === "string" ? p : typeof (p as any)?.text === "string" ? (p as any).text : ""))
            .join("")
        }
      }

      if (!aiResponse.trim()) {
        aiResponse = `${AGENTS[agentForAPI].name}: I didn't receive any content from the model. Please rephrase or try again later.`
      }

      const aiMessage: Message = {
        role: "model",
        parts: [{ text: aiResponse }],
        agent: agentForAPI,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error:", error)
      // If the last message was a user message just sent, remove it before displaying error
      const lastMessage = messagesHistoryForAPI[messagesHistoryForAPI.length - 1]
      if (lastMessage && lastMessage.role === "user") {
        setMessages(messagesHistoryForAPI.slice(0, -1)) // Remove the last user message if it was just added
      }

      let errorMessage = "Sorry, I encountered an error. Please try again."
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "Authentication error. Please check the API configuration."
        } else if (error.message.includes("quota")) {
          errorMessage = "API quota exceeded. Please try again later."
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your internet connection."
        } else if (error.message.includes("Message blocked")) {
          errorMessage = `Could not generate response: ${error.message.replace("Message blocked: ", "")}. Please revise your message.`
        } else if (error.message.includes("Invalid JSON payload received")) {
          errorMessage =
            "There was an issue processing the request. This might be due to an invalid input format or API limitations. Please try a simpler message."
        } else if (error.message.includes("The model is overloaded")) {
          errorMessage = "The AI model is currently overloaded. Please try again in a few moments."
        }
      }

      const errorMsg: Message = {
        role: "model",
        parts: [{ text: `${AGENTS[agentForAPI].name}: ${errorMessage}` }],
        agent: agentForAPI,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (messageContent: string, historyContext: Message[], isResend = false) => {
    if (!messageContent.trim() || isLoading) return

    let currentAgentForAPI = selectedAgent // The agent whose persona the AI should adopt for this response
    let displayAgentMessage = false // Flag to show "Talking to..." popup
    let apiPromptText = messageContent // The actual text to send as the user's prompt to the API

    // Determine agent for API call and potential cross-agent interaction
    if (agentMode === "auto") {
      const autoDeterminedAgent = getAutoAgent(messageContent)
      if (autoDeterminedAgent !== selectedAgent) {
        currentAgentForAPI = autoDeterminedAgent
        displayAgentMessage = true
      }
    } else {
      // Custom mode: Check for cross-agent commands
      const agentMatch = messageContent.match(
        /(?:ask|talking to)\s+(Neura|Mira|Secura|Jett|Atlas|Prism|Forge)(?:\s+to)?\s*(.*)/i,
      )
      if (agentMatch) {
        const targetAgentName = agentMatch[1] as keyof typeof AGENTS
        const specificQuery = agentMatch[2].trim()

        if (AGENTS[targetAgentName]) {
          currentAgentForAPI = targetAgentName
          apiPromptText = specificQuery || messageContent // Use specific query if available, else full message
          displayAgentMessage = true // Indicate cross-agent interaction
        }
      }
    }

    // Add user message to local state if it's not a resend (which means it's already in historyContext)
    if (!isResend) {
      const userMessage: Message = {
        role: "user",
        parts: [{ text: messageContent }],
        timestamp: new Date(),
        attachedFile: historyContext.find((m) => m.role === "user" && m.parts[0].text === messageContent)?.attachedFile, // Preserve attached file info if present
      }
      setMessages((prev) => [...prev, userMessage])
    }

    // Process special commands first (like Jira or document generation)
    if (processSpecialCommands(messageContent)) {
      setIsLoading(false) // Ensure loading is off if a special command handles it
      return
    }

    if (displayAgentMessage) {
      setInteractionPopup({
        open: true,
        message: `Talking to ${AGENTS[currentAgentForAPI].name}...`,
        type: "agent",
      })
      setTimeout(() => {
        setSelectedAgent(currentAgentForAPI)
        setInteractionPopup(null) // Close popup after delay
        setIsLoading(true) // Start loading for actual API call
        sendApiRequest(currentAgentForAPI, apiPromptText, [
          ...historyContext,
          { role: "user", parts: [{ text: messageContent }], timestamp: new Date() },
        ]) // Pass updated history including the new user message
      }, 1000) // Short delay to show "Talking to..."
    } else {
      setSelectedAgent(currentAgentForAPI) // Ensure selected agent is updated even if no popup
      setIsLoading(true)
      sendApiRequest(currentAgentForAPI, apiPromptText, [
        ...historyContext,
        { role: "user", parts: [{ text: messageContent }], timestamp: new Date() },
      ]) // Pass updated history including the new user message
    }
  }

  const generateOKR = async () => {
    if (!okrFileContent && !okrExtra) {
      alert("Please attach a PRD or project document, or provide additional context.")
      return
    }

    setIsLoading(true)
    try {
      const backgroundPrompt = getBackgroundPrompt()
      let prompt = ""
      if (backgroundPrompt) {
        prompt += "[Background Information]\n" + backgroundPrompt + "\n"
      }
      prompt += `Given the following PRD or requirements, generate an OKR in this format:
OBJECTIVE: <objective>
Key Results:
- <key result 1>
- <key result 2>
- <key result 3>

Input:
${okrFileContent || ""}${okrExtra ? "\nAdditional Info:\n" + okrExtra : ""}`

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
        }),
      })

      const data = await response.json()
      const okr = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate OKR. Retry or Reload!"
      setOkrContent(okr)
    } catch (error) {
      setOkrContent("Error generating OKR. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File, type: "okr" | "background" | "chat") => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (type === "okr") {
        setOkrFileContent(content)
        setOkrFileName(file.name)
      } else if (type === "background") {
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
            url: URL.createObjectURL(file), // Create a temporary URL for display
            type: file.type,
          },
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
        setInput("") // Clear input after adding file message
      }
    }
    reader.readAsText(file) // Read as text, regardless of original file type, for content preview
  }

  const saveBackground = () => {
    setBackgroundInfo({
      file: backgroundFileContent,
      text: backgroundText,
    })
    setTimeout(() => {
      alert("Background saved!")
    }, 100)
  }

  const parseAgentResponse = (text: string) => {
    const agentMatch = text.match(/^(Neura|Mira|Secura|Jett|Atlas|Prism|Forge):\s*(.*)$/s)
    if (agentMatch) {
      return { agent: agentMatch[1], content: agentMatch[2] }
    }
    return { agent: "AI", content: text } // Fallback if no specific agent prefix
  }

  const copyMessage = (index: number) => {
    if (index < 0 || index >= messages.length) return

    const messageContent = messages[index].parts[0].text
    navigator.clipboard
      .writeText(messageContent)
      .then(() => {
        setCopiedMessageIndex(index)
        setTimeout(() => setCopiedMessageIndex(null), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  const redoMessage = async (index: number) => {
    if (index < 0 || index >= messages.length || messages[index].role !== "model") return

    const userMessageIndex = index - 1
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== "user") return

    const userMessageToResend = messages[userMessageIndex]
    const historyForAPI = messages.slice(0, index) // History up to and including the user message, excluding the AI response

    setInput(userMessageToResend.parts[0].text) // Set input for display
    sendMessage(userMessageToResend.parts[0].text, historyForAPI, true) // Call sendMessage with correct history and resend flag
  }

  const editMessage = (index: number) => {
    if (index < 0 || index >= messages.length) return

    const message = messages[index]
    const currentText = message.parts[0].text

    // Initialize edit history if it doesn't exist
    if (!messageEditHistory[index]) {
      setMessageEditHistory((prev) => ({
        ...prev,
        [index]: [currentText],
      }))
      setCurrentEditIndex((prev) => ({
        ...prev,
        [index]: 0,
      }))
    }

    setEditingMessage({ index, text: currentText })
  }

  const saveMessageEdit = async () => {
    if (!editingMessage) return

    const { index, text } = editingMessage
    const newText = text.trim()

    if (newText) {
      const isUserMessage = messages[index].role === "user"

      // Update edit history
      const currentHistory = messageEditHistory[index] || [messages[index].parts[0].text]
      const newHistory = [...currentHistory, newText]

      setMessageEditHistory((prev) => ({
        ...prev,
        [index]: newHistory,
      }))

      setCurrentEditIndex((prev) => ({
        ...prev,
        [index]: newHistory.length - 1,
      }))

      const updatedMessages = [...messages]
      updatedMessages[index].parts[0].text = newText

      // If editing a user message, remove all messages after it and resend
      if (isUserMessage) {
        const historyForAPI = updatedMessages.slice(0, index + 1) // History up to and including the edited user message
        setMessages(historyForAPI) // Update messages state to reflect the cut-off history
        setInput(newText) // Set input for display
        setEditingMessage(null)

        sendMessage(newText, historyForAPI, true) // Call sendMessage with correct history and resend flag
      } else {
        // If editing AI message, just update it
        setMessages(updatedMessages)
        setEditingMessage(null)
      }
    } else {
      setEditingMessage(null)
    }
  }

  const navigateEditHistory = (messageIndex: number, direction: "prev" | "next") => {
    const history = messageEditHistory[messageIndex]
    if (!history || history.length <= 1) return

    const currentIdx = currentEditIndex[messageIndex] || 0
    let newIdx = currentIdx

    if (direction === "prev" && currentIdx > 0) {
      newIdx = currentIdx - 1
    } else if (direction === "next" && currentIdx < history.length - 1) {
      newIdx = currentIdx + 1
    }

    if (newIdx !== currentIdx) {
      setCurrentEditIndex((prev) => ({
        ...prev,
        [messageIndex]: newIdx,
      }))

      setEditingMessage({
        index: messageIndex,
        text: history[newIdx],
      })
    }
  }

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === "user"
    const { agent, content } = isUser
      ? { agent: "", content: message.parts[0].text }
      : parseAgentResponse(message.parts[0].text)

    const agentInfo = message.agent ? AGENTS[message.agent as keyof typeof AGENTS] : null

    return (
      <div key={index} className={`group mb-4 ${isUser ? "mr-4" : "ml-4"}`}>
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <div className="flex-shrink-0">
            {isUser ? (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: agentInfo?.color || "#6B7280" }}
              >
                {(() => {
                  const AgentIcon = agentInfo?.icon
                  return AgentIcon ? <AgentIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />
                })()}
              </div>
            )}
          </div>

          <div
            className={`flex-1 min-w-0 ${isUser ? "max-w-[calc(100%-4rem)] ml-auto" : "max-w-[calc(100%-4rem)] mr-auto"}`}
          >
            <div className={`flex items-center gap-2 mb-1 ${isUser ? "justify-end" : "justify-start"}`}>
              <span className="text-sm font-medium text-gray-900">{isUser ? "You" : agentInfo?.name || "AI"}</span>
              {!isUser && agentInfo && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: agentInfo.color + "20", color: agentInfo.color }}
                >
                  {agentInfo.role}
                </Badge>
              )}
              <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
            </div>

            <div className={`${isUser ? "text-right" : "text-left"}`}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
                {message.attachedFile && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    <a
                      href={message.attachedFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      {message.attachedFile.name} ({message.attachedFile.type.split("/")[1]})
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div
              className={`flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {isUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-gray-500 hover:text-gray-700"
                  onClick={() => editMessage(index)}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-gray-500 hover:text-gray-700"
                onClick={() => copyMessage(index)}
              >
                {copiedMessageIndex === index ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
              {!isUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-gray-500 hover:text-gray-700"
                  onClick={() => redoMessage(index)}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

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
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        isActive ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" : "hover:bg-blue-50 text-gray-700"
      }`}
      onClick={() => setActiveSection(section)}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )

  const renderInteractionPopup = () => {
    if (!interactionPopup || !interactionPopup.open) return null

    let title = ""
    let icon = null
    const message = interactionPopup.message

    switch (interactionPopup.type) {
      case "jira":
        title = "Referring to Jira Information"
        icon = <Kanban className="w-6 h-6 text-blue-600" />
        break
      case "agent":
        title = "Interacting with another Agent"
        icon = <MessageSquare className="w-6 h-6 text-blue-600" />
        break
      case "edit":
        title = "Processing Edit"
        icon = <Edit3 className="w-6 h-6 text-blue-600" />
        break
      case "document":
        title = "Generating Document"
        icon = <File className="w-6 h-6 text-blue-600" />
        break
      default:
        title = "Processing Request"
        icon = <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
    }

    return (
      <Dialog open={interactionPopup.open} onOpenChange={() => setInteractionPopup(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center text-center">
            {icon}
            <DialogTitle className="mt-2">{title}</DialogTitle>
            <DialogDescription className="text-center">{message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const renderDocumentPopup = () => {
    if (!documentPopup || !documentPopup.open) return null

    const handleSave = () => {
      const blob = new Blob([documentPopup.content], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${documentPopup.title.replace(/\s/g, "-")}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    return (
      <Dialog open={documentPopup.open} onOpenChange={() => setDocumentPopup(null)}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="w-5 h-5" />
              {documentPopup.title}
            </DialogTitle>
            <DialogDescription>Here is the generated document. You can copy or save it.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-4 border rounded-md bg-gray-50 overflow-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{documentPopup.content}</ReactMarkdown>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(documentPopup.content)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save as Markdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              <NavButton icon={MessageSquare} label="Chat" section="chat" isActive={activeSection === "chat"} />
              <NavButton icon={Target} label="OKR" section="okr" isActive={activeSection === "okr"} />
              <NavButton
                icon={FileText}
                label="Background"
                section="background"
                isActive={activeSection === "background"}
              />
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
                    icon: MessageSquare,
                    title: "AI Chat",
                    desc: "Talk to specialized AI agents",
                    color: "from-blue-500 to-blue-600",
                  },
                  {
                    icon: Target,
                    title: "OKR Generator",
                    desc: "Create objectives and key results",
                    color: "from-indigo-500 to-indigo-600",
                  },
                  {
                    icon: Kanban,
                    title: "Project Board",
                    desc: "Manage tasks and workflows",
                    color: "from-purple-500 to-purple-600",
                  },
                  {
                    icon: FileText,
                    title: "Documentation",
                    desc: "Store project context",
                    color: "from-cyan-500 to-cyan-600",
                  },
                ].map((item, i) => (
                  <Card
                    key={i}
                    className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm cursor-pointer group hover:scale-105"
                    onClick={() =>
                      setActiveSection(
                        item.title.toLowerCase().includes("chat")
                          ? "chat"
                          : item.title.toLowerCase().includes("okr")
                            ? "okr"
                            : item.title.toLowerCase().includes("project")
                              ? "chat" // Project Board might lead to a Jira-like chat interaction
                              : "background",
                      )
                    }
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

        {/* Chat Section */}
        {activeSection === "chat" && (
          <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-12rem)] min-h-[500px]">
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <div className="flex flex-col h-full p-4 pr-2">
                {/* Agent Selection Bar */}
                <Card className="p-4 bg-white/70 backdrop-blur-sm border-blue-100 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">AI Agent Mode</h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <Button
                        variant={agentMode === "auto" ? "default" : "outline"}
                        className={`${
                          agentMode === "auto"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "hover:bg-blue-50 border-blue-200"
                        }`}
                        onClick={() => {
                          setAgentMode("auto")
                          setShowAgentDropdown(false)
                        }}
                      >
                        Auto
                      </Button>
                      <Button
                        variant={agentMode === "custom" ? "default" : "outline"}
                        className={`${
                          agentMode === "custom"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "hover:bg-blue-50 border-blue-200"
                        }`}
                        onClick={() => {
                          setAgentMode("custom")
                          setShowAgentDropdown(true)
                        }}
                      >
                        Custom
                      </Button>
                    </div>

                    {agentMode === "custom" && (
                      <div className="relative z-50">
                        {" "}
                        {/* Ensure high z-index for dropdown */}
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-blue-200 hover:bg-blue-50 bg-transparent w-full justify-start"
                          onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                        >
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: AGENTS[selectedAgent].color }}
                          >
                            {(() => {
                              const SelectedIcon = AGENTS[selectedAgent].icon
                              return <SelectedIcon className="w-2 h-2" />
                            })()}
                          </div>
                          {AGENTS[selectedAgent].name}
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        </Button>
                        {showAgentDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-blue-200 rounded-lg shadow-lg z-[60]">
                            {Object.entries(AGENTS).map(([key, agent]) => (
                              <Button
                                key={key}
                                variant="ghost"
                                className="w-full justify-start p-3 hover:bg-blue-50"
                                onClick={() => {
                                  setSelectedAgent(key as keyof typeof AGENTS)
                                  setShowAgentDropdown(false)
                                }}
                              >
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white mr-3"
                                  style={{ backgroundColor: agent.color }}
                                >
                                  <agent.icon className="w-3 h-3" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-sm">{agent.name}</div>
                                  <div className="text-xs text-gray-500">{agent.role}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {agentMode === "auto" ? (
                        <>
                          <strong>Auto Mode:</strong> AI will automatically select the best agent based on your message
                        </>
                      ) : (
                        <>
                          <strong>{AGENTS[selectedAgent].name}:</strong> {AGENTS[selectedAgent].description}
                        </>
                      )}
                    </p>
                  </div>
                </Card>

                {/* Quick Commands Helper */}
                <Card className="p-4 bg-white/70 backdrop-blur-sm border-blue-100 flex-1 flex flex-col">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Commands for {AGENTS[selectedAgent].name}
                  </h4>
                  <ScrollArea className="flex-1 -mr-2 pr-2">
                    {" "}
                    {/* Negative margin and padding for custom scrollbar */}
                    <div className="grid grid-cols-1 gap-2">
                      {QUICK_COMMANDS.filter((cmd) => cmd.agent === selectedAgent).map((cmd, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          className="justify-start h-auto p-2 text-left hover:bg-blue-100"
                          onClick={() => setInput(cmd.example)}
                        >
                          <div>
                            <div className="font-medium text-sm text-blue-800">{cmd.command}</div>
                            <div className="text-xs text-blue-600">{cmd.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={75} minSize={40}>
              <div className="flex flex-col h-full p-4 pl-2">
                <Card className="bg-white/70 backdrop-blur-sm border-blue-100 overflow-hidden flex-1 flex flex-col">
                  {/* Chat Messages */}
                  <ScrollArea className="flex-1 p-6">
                    {messages.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-500 mb-4">Start a conversation with {AGENTS[selectedAgent].name}</p>
                        <p className="text-sm text-gray-400">
                          Try asking about product strategy, roadmaps, or Jira workflows
                        </p>
                      </div>
                    ) : (
                      <div>{messages.map(renderMessage)}</div>
                    )}
                    {isLoading && (
                      <div className="flex gap-3 mb-6 ml-4">
                        {(() => {
                          const SelectedIcon = AGENTS[selectedAgent].icon
                          return (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: AGENTS[selectedAgent].color }}
                            >
                              <SelectedIcon className="w-4 h-4" />
                            </div>
                          )
                        })()}
                        <div className="bg-gray-100 px-4 py-3 max-w-[calc(100%-4rem)]">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  {/* Chat Input */}
                  <div className="border-t border-blue-100 p-4 bg-white/50">
                    <div className="relative">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${AGENTS[selectedAgent].name}...`}
                        className="min-h-[44px] max-h-32 resize-none border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage(input, messages, false) // Pass current input and messages state
                            setInput("") // Clear input immediately
                          }
                        }}
                      />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                          onClick={() => chatFileInputRef.current?.click()}
                        >
                          <Paperclip className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                          onClick={() => {
                            sendMessage(input, messages, false) // Pass current input and messages state
                            setInput("") // Clear input immediately
                          }}
                          disabled={!input.trim() || isLoading}
                          size="sm"
                          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                      <input
                        ref={chatFileInputRef}
                        type="file"
                        accept=".pdf,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, "chat")
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {/* OKR Section */}
        {activeSection === "okr" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                OKR Generator
              </h2>
              <p className="text-gray-600">Generate objectives and key results for your product</p>
            </div>

            <Card className="p-6 border-0 bg-white/70 backdrop-blur-sm border-blue-100">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Attach a PRD or Context</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="bg-white border-blue-200 hover:bg-blue-50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    {okrFileName && <span className="text-sm text-gray-600">{okrFileName}</span>}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "okr")
                    }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Additional Context</Label>
                  <Textarea
                    value={okrExtra}
                    onChange={(e) => setOkrExtra(e.target.value)}
                    placeholder="Add any extra information or context..."
                    className="min-h-[100px] border-blue-200 focus:ring-blue-500"
                  />
                </div>
                <Button onClick={generateOKR} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate OKR"
                  )}
                </Button>
              </div>
            </Card>

            {okrContent && (
              <Card className="p-6 border-0 bg-white/70 backdrop-blur-sm border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Generated OKR</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setOkrContent(okrContent)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(okrContent)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={generateOKR}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{okrContent}</ReactMarkdown>
                </div>
              </Card>
            )}
          </div>
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

      {/* Message Edit Modal */}
      {editingMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-900">Edit Message</h3>
                {messageEditHistory[editingMessage.index] && messageEditHistory[editingMessage.index].length > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateEditHistory(editingMessage.index, "prev")}
                      disabled={!currentEditIndex[editingMessage.index] || currentEditIndex[editingMessage.index] === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-500">
                      {(currentEditIndex[editingMessage.index] || 0) + 1} /{" "}
                      {messageEditHistory[editingMessage.index].length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateEditHistory(editingMessage.index, "next")}
                      disabled={
                        !messageEditHistory[editingMessage.index] ||
                        (currentEditIndex[editingMessage.index] || 0) >=
                          messageEditHistory[editingMessage.index].length - 1
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditingMessage(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={editingMessage.text}
              onChange={(e) => setEditingMessage({ ...editingMessage, text: e.target.value })}
              className="min-h-[200px] mb-4 border-blue-200 focus:ring-blue-500"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingMessage(null)}>
                Cancel
              </Button>
              <Button onClick={saveMessageEdit} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {renderInteractionPopup()}
      {renderDocumentPopup()}
    </div>
  )
}
