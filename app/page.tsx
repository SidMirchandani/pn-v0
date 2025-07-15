"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Plus,
  Edit3,
  Copy,
  RotateCcw,
  Upload,
  Calendar,
  BarChart3,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"

const API_KEY = "AIzaSyC4v647dYrneDbR2K5BJwJ4sbvq43fZtRc"
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

interface Message {
  role: "user" | "model"
  parts: { text: string }[]
  agent?: string
  timestamp: Date
}

interface JiraCard {
  key: string
  title: string
  description?: string
  assignee: string
  status: string
  priority?: string
  tags?: string[]
  avatar: string
}

const AGENTS = {
  Neura: {
    name: "Neura",
    role: "Product Manager",
    color: "#3B82F6",
    icon: Brain,
    description: "Strategic product decisions and roadmaps",
  },
  Mira: {
    name: "Mira",
    role: "Marketing Manager",
    color: "#F59E0B",
    icon: Sparkles,
    description: "Go-to-market and growth strategies",
  },
  Secura: {
    name: "Secura",
    role: "Cybersecurity",
    color: "#10B981",
    icon: Shield,
    description: "Security architecture and compliance",
  },
  Jett: {
    name: "Jett",
    role: "Program Manager",
    color: "#8B5CF6",
    icon: Zap,
    description: "Project coordination and delivery",
  },
  Atlas: {
    name: "Atlas",
    role: "Architect",
    color: "#06B6D4",
    icon: Layers,
    description: "System design and technical architecture",
  },
  Prism: {
    name: "Prism",
    role: "Full Stack Designer",
    color: "#EC4899",
    icon: Palette,
    description: "UI/UX design and user experience",
  },
  Forge: {
    name: "Forge",
    role: "Developer",
    color: "#EF4444",
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

const HARDCODED_DUMMY_DATA = `Product Hunt Inc.
Discover and geek out on new tech
Connect curious users with innovative launches
Community Product Manager
ryan@producthunt.co
producthunt.co
https://www.producthunt.com
415-555-3021
144 Market Street Suite 500
San Francisco
California
94103
144 Market Street Suite 500, San Francisco, CA 94103
87-1984762
2013
Account Holder: Ryan Hoover
Account Number: PHNT98347492827345
Routing Number: 121000358
IBAN: US72PHNT00300348739284
SWIFT Code: PHNTUS6S
Bank Name: Silicon Valley Innovation Bank
Balance (USD): $23,987.14
Last Transaction: Date: 2025-07-01T20:17:25 Amount: $320.00 Description: Promoted listing campaign Merchant: BetaList Inc.
Product Name: Async Voice Notes
Adjective: Coral
Category: productivity
Price (USD): $12.00/month
Description: Record and send async voice notes to your team for quick alignment.
SKU: 0023749539201
Ryan Hoover: Founder & Product Geek
Kat Mañalac: Seed-Stage VC Advisor
Sahil Lavingia: Indie Hacker & Community Advocate
Julie Zhuo: Product Strategy Advisor
Josh Elman: Seed-Stage Investor
Ben Tossell: No-Code Tools Curator
Hiten Shah: SaaS & Growth Mentor`

const HARDCODED_BG_TEXT =
  "Product Hunt is the leading platform to discover and geek out on new tech. Our mission is to connect curious users with innovative launches. Founded in 2013, we have a vibrant community and a strong track record in product discovery."

const DUMMY_JIRA_CARDS = {
  todo: [
    {
      key: "KAN-1",
      title: "Test Data",
      description: "Add comprehensive test data to the system",
      assignee: "Ryan Hoover",
      status: "TO DO",
      priority: "Medium",
      tags: ["testing", "data"],
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      key: "KAN-3",
      title: "Remove Errors",
      description: "Fix critical bugs in the application",
      assignee: "Kat Mañalac",
      status: "TO DO",
      priority: "High",
      tags: ["bug", "critical"],
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      key: "KAN-4",
      title: "Add test data",
      description: "Populate database with sample data",
      assignee: "Sahil Lavingia",
      status: "TO DO",
      priority: "Low",
      tags: ["data", "setup"],
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      key: "KAN-5",
      title: "Add API permissions",
      description: "Implement proper API access controls",
      assignee: "Julie Zhuo",
      status: "TO DO",
      priority: "High",
      tags: ["security", "api"],
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ],
  inprogress: [
    {
      key: "KAN-2",
      title: "Add documentation",
      description: "Create comprehensive API documentation",
      assignee: "Josh Elman",
      status: "IN PROGRESS",
      priority: "Medium",
      tags: ["docs", "api"],
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ],
  done: [
    {
      key: "KAN-6",
      title: "Get API Key",
      description: "Obtain API key from service provider",
      assignee: "Ben Tossell",
      status: "DONE",
      priority: "High",
      tags: ["setup", "api"],
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      key: "KAN-7",
      title: "Set up API Subscription",
      description: "Configure paid API subscription",
      assignee: "Hiten Shah",
      status: "DONE",
      priority: "Medium",
      tags: ["setup", "billing"],
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ],
}

const JIRA_COMMANDS = [
  {
    command: "Turn this PRD into linked Jira workitems",
    description: "Create structured work items from product requirements",
    example: "Turn the mobile app PRD into linked Jira workitems with proper dependencies",
  },
  {
    command: "Show me all use cases tied to PRD XYZ",
    description: "Retrieve and display related work items",
    example: "Show me all use cases tied to the authentication system PRD",
  },
  {
    command: "Add the XYZ feature to all open workitems",
    description: "Bulk update multiple work items",
    example: "Add the dark mode feature to all open UI workitems",
  },
  {
    command: "Remove deprecated tasks from this initiative",
    description: "Clean up outdated work items",
    example: "Remove deprecated OAuth 1.0 tasks from the authentication initiative",
  },
  {
    command: "Create sprint from backlog items tagged 'urgent'",
    description: "Generate sprints based on criteria",
    example: "Create a 2-week sprint from backlog items tagged 'urgent' and 'bug'",
  },
  {
    command: "Generate test cases for feature XYZ",
    description: "Auto-create testing work items",
    example: "Generate test cases for the payment processing feature",
  },
  {
    command: "Link all frontend tasks to design system epic",
    description: "Create relationships between work items",
    example: "Link all frontend tasks to the design system epic for better tracking",
  },
  {
    command: "Estimate story points for backlog using similar completed work",
    description: "AI-powered estimation based on historical data",
    example: "Estimate story points for the user profile backlog using similar completed work",
  },
]

export default function ProductNow() {
  const [activeSection, setActiveSection] = useState("chat")
  const [selectedAgent, setSelectedAgent] = useState<keyof typeof AGENTS>("Neura")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [okrContent, setOkrContent] = useState("")
  const [okrExtra, setOkrExtra] = useState("")
  const [okrFileContent, setOkrFileContent] = useState(HARDCODED_DUMMY_DATA)
  const [okrFileName, setOkrFileName] = useState("Product Hunt.pdf")
  const [backgroundInfo, setBackgroundInfo] = useState({
    file: HARDCODED_DUMMY_DATA,
    text: HARDCODED_BG_TEXT,
  })
  const [backgroundFileContent, setBackgroundFileContent] = useState(HARDCODED_DUMMY_DATA)
  const [backgroundFileName, setBackgroundFileName] = useState("Product Hunt.pdf")
  const [backgroundText, setBackgroundText] = useState(HARDCODED_BG_TEXT)
  const [jiraCards, setJiraCards] = useState(DUMMY_JIRA_CARDS)
  const [editingMessage, setEditingMessage] = useState<{ index: number; text: string } | null>(null)
  const [jiraModal, setJiraModal] = useState<{ open: boolean; status: string; index: number; card?: JiraCard }>({
    open: false,
    status: "",
    index: -1,
  })
  const [newCard, setNewCard] = useState<Partial<JiraCard>>({})
  const [isEditingOkr, setIsEditingOkr] = useState(false)
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

  // Initialize with default OKR
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

  const getBackgroundPrompt = () => {
    let prompt = ""
    if (backgroundInfo.file) prompt += backgroundInfo.file + "\n"
    if (backgroundInfo.text) prompt += backgroundInfo.text + "\n"
    return prompt.trim()
  }

  const processJiraCommand = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Check for CRUD commands
    if (lowerMessage.includes("turn") && lowerMessage.includes("prd") && lowerMessage.includes("jira")) {
      return "I'll help you convert that PRD into structured Jira work items. Based on the document, I can create:\n\n**Epic**: Async Voice Notes Implementation\n\n**Stories**:\n- User Authentication & Onboarding\n- Voice Recording Interface\n- Audio Processing & Storage\n- Team Collaboration Features\n- Integration with Productivity Tools\n\n**Tasks**:\n- Set up audio recording API\n- Design voice note UI components\n- Implement file compression\n- Create sharing mechanisms\n- Add notification system\n\nWould you like me to create these work items with proper linking and dependencies?"
    }

    if (lowerMessage.includes("show") && lowerMessage.includes("use cases")) {
      return "Here are all use cases tied to the current PRD:\n\n**Primary Use Cases**:\n1. **Quick Team Updates** - Record brief status updates instead of typing\n2. **Async Feedback** - Leave voice comments on designs/documents\n3. **Meeting Summaries** - Capture key decisions and action items\n4. **Remote Collaboration** - Bridge timezone gaps with voice messages\n\n**Secondary Use Cases**:\n1. **Client Communication** - Send personalized voice updates\n2. **Documentation** - Verbal explanations for complex processes\n3. **Training** - Create voice-guided tutorials\n\n**Related Jira Items**: KAN-1, KAN-2, KAN-5 are all connected to these use cases."
    }

    if (lowerMessage.includes("add") && lowerMessage.includes("feature") && lowerMessage.includes("workitems")) {
      return "I'll add the requested feature to all relevant open work items:\n\n**Updated Work Items**:\n- KAN-1: Test Data → Now includes feature testing scenarios\n- KAN-3: Remove Errors → Added feature-specific error handling\n- KAN-4: Add test data → Expanded to include feature test data\n- KAN-5: API permissions → Updated to include feature-specific permissions\n\n**Impact Summary**:\n- 4 work items updated\n- Estimated additional effort: 8 story points\n- Timeline impact: +2 days\n\nAll items have been tagged with the new feature label for tracking."
    }

    if (lowerMessage.includes("remove") && lowerMessage.includes("deprecated")) {
      return "I've identified and removed deprecated tasks from the initiative:\n\n**Removed Items**:\n- Legacy OAuth 1.0 implementation tasks\n- Old API endpoint documentation\n- Deprecated UI component updates\n- Outdated security protocols\n\n**Cleanup Summary**:\n- 6 deprecated tasks removed\n- 12 story points freed up\n- 3 blocked items now unblocked\n- Sprint capacity increased by 15%\n\nThe initiative is now streamlined and focused on current requirements."
    }

    return null
  }

  const sendMessage = async (isResend = false) => {
    if (!isResend && (!input.trim() || isLoading)) return

    let newMessages = [...messages]
    if (!isResend) {
      const userMessage: Message = {
        role: "user",
        parts: [{ text: input }],
        timestamp: new Date(),
      }
      newMessages = [...messages, userMessage]
      setMessages(newMessages)

      // Check for Jira commands first
      const jiraResponse = processJiraCommand(input)
      if (jiraResponse) {
        const jiraMessage: Message = {
          role: "model",
          parts: [{ text: `${AGENTS[selectedAgent].name}: ${jiraResponse}` }],
          agent: selectedAgent,
          timestamp: new Date(),
        }
        setMessages([...newMessages, jiraMessage])
        setInput("")
        return
      }

      setInput("")
    }

    setIsLoading(true)

    try {
      const contextParts = []
      if (AGENT_ROLE_CONTEXT) contextParts.push(AGENT_ROLE_CONTEXT)
      contextParts.push("[Dummy Data]\n" + HARDCODED_DUMMY_DATA)
      contextParts.push("[Background Info]\n" + HARDCODED_BG_TEXT)

      const backgroundPrompt = getBackgroundPrompt()
      if (backgroundPrompt) contextParts.push("[User Background]\n" + backgroundPrompt)

      contextParts.push(
        `INSTRUCTION: Always answer as ${selectedAgent} (${AGENTS[selectedAgent].role}). Start your answer with "${selectedAgent}: " and focus on your area of expertise.`,
      )

      const fullHistory = [{ role: "user" as const, parts: [{ text: contextParts.join("\n\n") }] }, ...newMessages]

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
      const candidate = data.candidates?.[0]
      const parts = candidate?.content?.parts

      let aiResponse = ""

      if (Array.isArray(parts) && parts.length > 0) {
        const firstPart = parts[0]
        aiResponse =
          typeof firstPart === "string" ? firstPart : typeof firstPart?.text === "string" ? firstPart.text : ""
      }

      if (!aiResponse.trim()) {
        if (data.promptFeedback?.blockReason) {
          throw new Error(`Message blocked: ${data.promptFeedback.blockReason}`)
        }
        throw new Error("Invalid response format from API")
      }

      const aiMessage: Message = {
        role: "model",
        parts: [{ text: aiResponse }],
        agent: selectedAgent,
        timestamp: new Date(),
      }
      setMessages([...newMessages, aiMessage])
    } catch (error) {
      console.error("Error:", error)
      if (!isResend && newMessages.length > 0 && newMessages[newMessages.length - 1].role === "user") {
        newMessages.pop()
        setMessages(newMessages)
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
        }
      }

      const errorMsg: Message = {
        role: "model",
        parts: [{ text: `${selectedAgent}: ${errorMessage}` }],
        agent: selectedAgent,
        timestamp: new Date(),
      }
      setMessages([...newMessages, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const generateOKR = async () => {
    if (!okrFileContent) {
      alert("Please attach a PRD or project document.")
      return
    }

    setIsLoading(true)
    try {
      const backgroundPrompt = getBackgroundPrompt()
      let prompt = ""
      if (backgroundPrompt) {
        prompt += "[Background Info]\n" + backgroundPrompt + "\n"
      }
      prompt += `Given the following PRD or requirements, generate an OKR in this format:
OBJECTIVE: <objective>
Key Results:
- <key result 1>
- <key result 2>
- <key result 3>

Input:
${okrFileContent}${okrExtra ? "\nAdditional Info:\n" + okrExtra : ""}`

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
    if (file.type === "application/pdf") {
      // For demo purposes, we'll use the dummy data
      if (type === "okr") {
        setOkrFileContent(HARDCODED_DUMMY_DATA)
        setOkrFileName(file.name)
      } else if (type === "background") {
        setBackgroundFileContent(HARDCODED_DUMMY_DATA)
        setBackgroundFileName(file.name)
      } else if (type === "chat") {
        // Handle chat file upload
        setInput((prev) => prev + `\n[Attached: ${file.name}]`)
      }
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
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
          setInput((prev) => prev + `\n[Attached: ${file.name}]\n${content}`)
        }
      }
      reader.readAsText(file)
    } else {
      alert("Unsupported file type. Please upload a PDF or TXT file.")
    }
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
    return { agent: "AI", content: text }
  }

  const copyMessage = (index: number) => {
    if (index < 0 || index >= messages.length) return

    const message = messages[index].parts[0].text
    navigator.clipboard
      .writeText(message)
      .then(() => {
        console.log("Copied!")
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  const redoMessage = async (index: number) => {
    if (index < 0 || index >= messages.length || messages[index].role !== "model") return

    const userMessageIndex = index - 1
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== "user") return

    const newMessages = messages.slice(0, index)
    setMessages(newMessages)

    await sendMessage(true)
  }

  const editMessage = (index: number) => {
    if (index < 0 || index >= messages.length) return

    const message = messages[index]
    setEditingMessage({ index, text: message.parts[0].text })
  }

  const saveMessageEdit = async () => {
    if (!editingMessage) return

    const { index, text } = editingMessage
    const newText = text.trim()

    if (newText) {
      const isAIMessage = messages[index].role === "model"

      const updatedMessages = [...messages]
      updatedMessages[index].parts[0].text = newText

      const finalMessages = updatedMessages.slice(0, index + 1)
      setMessages(finalMessages)

      if (!isAIMessage) {
        await sendMessage(true)
      }
    }

    setEditingMessage(null)
  }

  const openJiraModal = (status: string, index = -1) => {
    if (index === -1) {
      setNewCard({
        title: "",
        description: "",
        assignee: "",
        priority: "Low",
        tags: [],
      })
    } else {
      const card = jiraCards[status as keyof typeof jiraCards][index]
      setNewCard({ ...card })
    }
    setJiraModal({ open: true, status, index })
  }

  const saveJiraCard = () => {
    const { status, index } = jiraModal
    if (!newCard.title?.trim()) return

    const card: JiraCard = {
      key: newCard.key || `KAN-${Date.now()}`,
      title: newCard.title,
      description: newCard.description || "",
      assignee: newCard.assignee || "",
      status: status.toUpperCase().replace("INPROGRESS", "IN PROGRESS"),
      priority: newCard.priority || "Low",
      tags: newCard.tags || [],
      avatar: "/placeholder.svg?height=32&width=32",
    }

    const updatedCards = { ...jiraCards }
    if (index === -1) {
      updatedCards[status as keyof typeof jiraCards].push(card)
    } else {
      updatedCards[status as keyof typeof jiraCards][index] = card
    }

    setJiraCards(updatedCards)
    setJiraModal({ open: false, status: "", index: -1 })
    setNewCard({})
  }

  const deleteJiraCard = (status: string, index: number) => {
    if (confirm("Delete this card?")) {
      const updatedCards = { ...jiraCards }
      updatedCards[status as keyof typeof jiraCards].splice(index, 1)
      setJiraCards(updatedCards)
    }
  }

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === "user"
    const { agent, content } = isUser
      ? { agent: "", content: message.parts[0].text }
      : parseAgentResponse(message.parts[0].text)

    const agentInfo = message.agent ? AGENTS[message.agent as keyof typeof AGENTS] : null

    return (
      <div key={index} className={`group mb-6 ${isUser ? "ml-12" : "mr-12"}`}>
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

          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 mb-1 ${isUser ? "justify-end" : "justify-start"}`}>
              <span className="text-sm font-medium text-gray-900">{isUser ? "You" : agentInfo?.name || "AI"}</span>
              {!isUser && agentInfo && (
                <Badge variant="secondary" className="text-xs">
                  {agentInfo.role}
                </Badge>
              )}
              <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
            </div>

            <div
              className={`rounded-2xl px-4 py-3 ${
                isUser ? "bg-blue-600 text-white ml-auto max-w-[80%]" : "bg-gray-100 text-gray-900 mr-auto max-w-[80%]"
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>

            {/* Action buttons outside the message bubble */}
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
                <Copy className="w-3 h-3" />
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
  }: { icon: any; label: string; section: string; isActive: boolean }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        isActive ? "bg-blue-600 text-white shadow-sm" : "hover:bg-blue-50 text-gray-700"
      }`}
      onClick={() => setActiveSection(section)}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
              <NavButton icon={Kanban} label="Jira" section="jira" isActive={activeSection === "jira"} />
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                              ? "jira"
                              : "background",
                      )
                    }
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Section */}
        {activeSection === "chat" && (
          <div className="max-w-4xl mx-auto">
            {/* Agent Selection Bar */}
            <div className="mb-6">
              <Card className="p-4 bg-white/70 backdrop-blur-sm border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Select AI Agent</h3>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {Object.keys(messages).length} messages
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {Object.entries(AGENTS).map(([key, agent]) => (
                    <Button
                      key={key}
                      variant={selectedAgent === key ? "default" : "outline"}
                      className={`flex flex-col items-center gap-2 h-auto py-3 px-2 ${
                        selectedAgent === key
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-blue-50 border-blue-200"
                      }`}
                      onClick={() => setSelectedAgent(key as keyof typeof AGENTS)}
                    >
                      <agent.icon className="w-5 h-5" />
                      <div className="text-center">
                        <div className="font-medium text-xs">{agent.name}</div>
                        <div className="text-xs opacity-75">{agent.role}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>{AGENTS[selectedAgent].name}:</strong> {AGENTS[selectedAgent].description}
                  </p>
                </div>
              </Card>
            </div>

            {/* Jira Commands Helper */}
            <div className="mb-6">
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Jira Commands
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {JIRA_COMMANDS.slice(0, 4).map((cmd, i) => (
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
              </Card>
            </div>

            {/* Chat Messages */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-100 overflow-hidden">
              <ScrollArea className="h-[500px] p-6">
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
                  <div className="flex gap-3 mb-6">
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
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
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
                    className="min-h-[44px] max-h-32 resize-none border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20 bg-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
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
                      onClick={() => sendMessage()}
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
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingOkr(!isEditingOkr)}>
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
                {isEditingOkr ? (
                  <div className="space-y-4">
                    <Textarea
                      value={okrContent}
                      onChange={(e) => setOkrContent(e.target.value)}
                      className="min-h-[200px] border-blue-200 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditingOkr(false)} className="bg-blue-600 hover:bg-blue-700">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingOkr(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{okrContent}</ReactMarkdown>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Jira Section */}
        {activeSection === "jira" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Project Management
              </h2>
              <p className="text-gray-600">Manage your product development workflow</p>
            </div>

            <Tabs defaultValue="board" className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto bg-blue-50 border-blue-200">
                <TabsTrigger value="board" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Board
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Timeline
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Calendar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="board" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(jiraCards).map(([status, cards]) => (
                    <Card key={status} className="p-4 border-0 bg-white/70 backdrop-blur-sm border-blue-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold capitalize text-gray-900">
                          {status.replace("inprogress", "In Progress")}
                        </h3>
                        <Badge variant="outline" className="border-blue-200 text-blue-600">
                          {cards.length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {cards.map((card, index) => (
                          <Card
                            key={card.key}
                            className="p-3 hover:shadow-md transition-shadow cursor-pointer group bg-white border-gray-200"
                          >
                            <div className="font-medium text-sm mb-2 text-gray-900">{card.title}</div>
                            {card.description && <div className="text-xs text-gray-600 mb-2">{card.description}</div>}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {card.key}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <img src={card.avatar || "/placeholder.svg"} alt="" className="w-5 h-5 rounded-full" />
                                <span>{card.assignee.split(" ")[0]}</span>
                              </div>
                            </div>
                            {card.tags && card.tags.length > 0 && (
                              <div className="flex gap-1 mb-2">
                                {card.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs hover:bg-blue-100"
                                onClick={() => openJiraModal(status, index)}
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs hover:bg-red-100 hover:text-red-600"
                                onClick={() => deleteJiraCard(status, index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openJiraModal(status)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add card
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-8">
                <Card className="border-0 bg-white/70 backdrop-blur-sm border-blue-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-blue-100">
                          <th className="text-left p-4 font-semibold text-gray-900">Key</th>
                          <th className="text-left p-4 font-semibold text-gray-900">Summary</th>
                          <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                          <th className="text-left p-4 font-semibold text-gray-900">Assignee</th>
                          <th className="text-left p-4 font-semibold text-gray-900">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(jiraCards).flatMap(([status, cards]) =>
                          cards.map((card) => (
                            <tr key={card.key} className="border-b border-gray-100 hover:bg-blue-50">
                              <td className="p-4">
                                <Badge variant="outline" className="text-xs">
                                  {card.key}
                                </Badge>
                              </td>
                              <td className="p-4 text-gray-900">{card.title}</td>
                              <td className="p-4">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    status === "done"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : status === "inprogress"
                                        ? "bg-blue-100 text-blue-800 border-blue-200"
                                        : "bg-gray-100 text-gray-800 border-gray-200"
                                  }`}
                                >
                                  {card.status}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={card.avatar || "/placeholder.svg"}
                                    alt=""
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span className="text-gray-900">{card.assignee}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    card.priority === "High" || card.priority === "Critical"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : card.priority === "Medium"
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                        : "bg-gray-100 text-gray-800 border-gray-200"
                                  }`}
                                >
                                  {card.priority}
                                </Badge>
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="mt-8">
                <Card className="p-6 border-0 bg-white/70 backdrop-blur-sm border-blue-100">
                  <div className="text-center py-20">
                    <BarChart3 className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                    <p className="text-gray-500">Timeline view coming soon</p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="mt-8">
                <Card className="p-6 border-0 bg-white/70 backdrop-blur-sm border-blue-100">
                  <div className="text-center py-20">
                    <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                    <p className="text-gray-500">Calendar view coming soon</p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
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
                    value={backgroundText}
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
              <h3 className="font-semibold text-gray-900">Edit Message</h3>
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

      {/* Jira Card Modal */}
      {jiraModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{jiraModal.index === -1 ? "Add" : "Edit"} Card</h3>
              <Button variant="ghost" size="sm" onClick={() => setJiraModal({ open: false, status: "", index: -1 })}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">Title</Label>
                <Input
                  value={newCard.title || ""}
                  onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                  placeholder="Enter title..."
                  className="border-blue-200 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">Description</Label>
                <Textarea
                  value={newCard.description || ""}
                  onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                  placeholder="Enter description..."
                  className="min-h-[80px] border-blue-200 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">Assignee</Label>
                <Input
                  value={newCard.assignee || ""}
                  onChange={(e) => setNewCard({ ...newCard, assignee: e.target.value })}
                  placeholder="Enter assignee..."
                  className="border-blue-200 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">Priority</Label>
                <Select
                  value={newCard.priority || "Low"}
                  onValueChange={(value) => setNewCard({ ...newCard, priority: value })}
                >
                  <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">Tags (comma separated)</Label>
                <Input
                  value={newCard.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setNewCard({
                      ...newCard,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Enter tags..."
                  className="border-blue-200 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setJiraModal({ open: false, status: "", index: -1 })}>
                Cancel
              </Button>
              <Button onClick={saveJiraCard} className="bg-blue-600 hover:bg-blue-700">
                {jiraModal.index === -1 ? "Add" : "Save"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
