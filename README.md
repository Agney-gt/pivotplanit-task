# pivotplanit-task

### ✅ Prompt: Build a Full-Stack Next.js 14 App for AI-Powered Task Generation and Management

---

### 🧩 Project Goal:

Develop a full-stack **Next.js 14** application that enables users to input a context (e.g., “How can I prepare for exam”) and get **3–5 AI-generated tasks** using **Langchain’s OpenAI integration**. These tasks must be editable, checkable (completed), persisted in local storage, and trigger a **webhook POST request** upon completion.

---

### 📦 Tech Stack Requirements:

* **Frontend:** Next.js 14 (App Router), React, TypeScript
* **UI Components:** `shadcn/ui` for all inputs, checkboxes, and toasts
* **AI Model:** Use generateObject to easily generate and parse data using OpenAI `gpt-3.5-turbo`
* **Storage:** Browser `localStorage` for persisting task edits/completions
* **API Handling:** `app/api/route.ts` or similar using `NextRequest` and `NextResponse`
* **Webhook Integration:** POST to [https://webhook.site/3afb15f6-03fd-463a-bbb1-ca67c8150fd9](https://webhook.site/3afb15f6-03fd-463a-bbb1-ca67c8150fd9)
![image](https://github.com/user-attachments/assets/a49af0a1-547f-4630-8f5c-8cc54a47ab24)


---

### 🔧 Features Breakdown

#### 1. **Input Interface**

* Use a **single text input** field labeled `Context`.
* Build using `shadcn/ui`’s `<Input />` component.
* Placeholder example texts:

  * “How can I prepare for exam”
  * “I am preparing to move out”
  * “I'd like to build a PC”
* Submit button should invoke the LLM API route and display a loading spinner using `shadcn/ui`'s `Button` with `isLoading`.

#### 2. **AI Task Generation**

* Use `ChatOpenAI` from `@langchain/openai`:

  ```ts
  const agentModel = process.env.OPENAI_API_KEY
    ? new ChatOpenAI({ temperature: 0, model: "gpt-3.5-turbo" });
  ```
* In the `POST` API route:

  * Accept JSON `{ content: string, threadId: string }`
  * Invoke LLM:

    ```ts
    const agentResponse = await agent.invoke(
      { messages: [new HumanMessage(content)] },
      { configurable: { thread_id: threadId } }
    );
    ```
  * The LLM **must return JSON** containing 3-5 tasks, structured as:

    ```json
    {
      "tasks": [
        {
          "name": "Research colleges",
          "description": "Look into universities offering psychology programs",
          "timeframe": "2 hours"
        },
        ...
      ]
    }
    ```

#### 3. **Task Management Interface**

* Parse the LLM’s JSON response and extract tasks.
* Render tasks inside a `div`, each as a card:

  * Use `shadcn/ui`’s `Card`, `Checkbox`, `Input`, and `Textarea`.
* Allow the following:

  * ✅ Mark a task as complete (toggle checkbox).
  * ✏️ Edit the **task name** and **description** in-place.
* Persist all changes (completion and edits) to **`localStorage`**.

  * Use `useEffect` on page load to rehydrate from localStorage.
  * Use `onChange` and `onBlur` events to sync changes.

#### 4. **Webhook Integration**

* When a task is marked complete:

  * Send a `POST` request to:
    `https://webhook.site/3afb15f6-03fd-463a-bbb1-ca67c8150fd9`
* Webhook payload should be defined as:

  ```json
  {
    "event": "task_completed",
    "task": {
      "name": "Submit tax documents",
      "description": "Upload tax-related paperwork",
      "timeframe": "1 hour"
    },
    "timestamp": "2025-06-19T20:00:00Z"
  }
  ```
* Use `fetch` for sending the webhook.
* Handle success/failure response with `shadcn/ui`’s `toast`:

  * ✅ "Webhook sent successfully"
  * ❌ "Webhook failed"

---

### ✅ Summary of Key Behaviors

| Feature             | Behavior                                           |
| ------------------- | -------------------------------------------------- |
| Input               | `shadcn/ui` Input, triggers LLM request            |
| AI Output           | JSON response with 3–5 tasks                       |
| Task Display        | Tasks rendered with editable fields and checkboxes |
| Local Persistence   | All task state saved to localStorage               |
| Webhook Trigger     | On task completion only                            |
| Toast Notifications | Webhook response feedback (success/failure)        |
| No Retry Logic      | One-time webhook trigger only                      |

---


