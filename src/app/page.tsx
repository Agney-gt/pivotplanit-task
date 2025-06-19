"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, CheckCircle2 } from "lucide-react"

interface Task {
  id: string
  name: string
  description: string
  timeframe: string
  completed: boolean
}

interface TaskResponse {
  tasks: Array<{
    name: string
    description: string
    timeframe: string
  }>
}

export default function TaskManager() {
  const [context, setContext] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [threadId] = useState(() => `thread_${Date.now()}`)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("ai-tasks")
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (error) {
        console.error("Error loading tasks from localStorage:", error)
      }
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("ai-tasks", JSON.stringify(tasks))
    }
  }, [tasks])

  const generateTasks = async () => {
    if (!context.trim()) {
      alert("Context Required: Please enter a context to generate tasks.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: context,
          threadId: threadId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate tasks")
      }

      const data: TaskResponse = await response.json()

      const newTasks: Task[] = data.tasks.map((task, index) => ({
        id: `task_${Date.now()}_${index}`,
        name: task.name,
        description: task.description,
        timeframe: task.timeframe,
        completed: false,
      }))

      setTasks(newTasks)
      alert(`Tasks Generated: Generated ${newTasks.length} tasks successfully!`)
    } catch (error) {
      console.error("Error generating tasks:", error)
      alert("Generation Failed: Failed to generate tasks. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)))
  }

  const sendWebhook = async (task: Task) => {
    try {
      const webhookPayload = {
        event: "task_completed",
        task: {
          name: task.name,
          description: task.description,
          timeframe: task.timeframe,
        },
        timestamp: new Date().toISOString(),
      }
      console.log(webhookPayload)
      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      })

      if (response.ok) {
        alert("Webhook Sent Successfully: Task completion notification sent!")
      } else {
        throw new Error("Webhook request failed")
      }
    } catch (error) {
      console.error("Webhook error:", error)
      alert("Webhook Failed: Failed to send completion notification.")
    }
  }

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newCompletedState = !task.completed
    updateTask(taskId, { completed: newCompletedState })

    // Send webhook only when marking as complete
    if (newCompletedState) {
      await sendWebhook({ ...task, completed: newCompletedState })
    }
  }

  const placeholderTexts = ["How can I prepare for exam", "I am preparing to move out", "I'd like to build a PC"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">AI Task Generator</h1>
          <p className="text-lg text-gray-600">Enter your context and get AI-powered task recommendations</p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Generate Tasks
            </CardTitle>
            <CardDescription>
              Describe what you want to accomplish, and AI will generate actionable tasks for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="context" className="text-sm font-medium">
                Context
              </label>
              <Input
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)]}
                className="text-base"
              />
            </div>
            <Button onClick={generateTasks} disabled={isLoading || !context.trim()} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Tasks...
                </>
              ) : (
                "Generate Tasks"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        {tasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Your Tasks</h2>
              <div className="text-sm text-gray-500">
                {tasks.filter((t) => t.completed).length} of {tasks.length} completed
              </div>
            </div>

            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  className={`transition-all ${task.completed ? "bg-green-50 border-green-200" : "bg-white"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                        className="mt-1"
                      />

                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Input
                            value={task.name}
                            onChange={(e) => updateTask(task.id, { name: e.target.value })}
                            className={`font-medium text-lg border-none p-0 h-auto bg-transparent ${task.completed ? "line-through text-gray-500" : ""}`}
                            placeholder="Task name"
                          />

                          <Textarea
                            value={task.description}
                            onChange={(e) => updateTask(task.id, { description: e.target.value })}
                            className={`border-none p-0 bg-transparent resize-none ${task.completed ? "line-through text-gray-500" : "text-gray-600"}`}
                            placeholder="Task description"
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">Timeframe:</span>
                          <Input
                            value={task.timeframe}
                            onChange={(e) => updateTask(task.id, { timeframe: e.target.value })}
                            className={`text-xs border-none p-0 h-auto bg-transparent w-auto ${task.completed ? "line-through text-gray-400" : "text-gray-500"}`}
                            placeholder="Estimated time"
                          />
                        </div>
                      </div>

                      {task.completed && <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
                  <p className="text-gray-500">Enter a context above to generate your first set of tasks.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
