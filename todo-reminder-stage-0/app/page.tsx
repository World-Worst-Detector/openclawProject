"use client";

import { useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  editing?: boolean;
};

const STORAGE_KEY = "one-todo-reminder-v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Todo[];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    const pending = total - done;
    return { total, done, pending };
  }, [todos]);

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [{ id: uid(), text, done: false }, ...prev]);
    setInput("");
  }

  function toggle(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function selectAll() {
    setTodos((prev) => prev.map((t) => ({ ...t, done: true })));
  }

  function deselectAll() {
    setTodos((prev) => prev.map((t) => ({ ...t, done: false })));
  }

  function removeOne(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, editing: true } : { ...t, editing: false })));
  }

  function saveEdit(id: string, text: string) {
    const clean = text.trim();
    if (!clean) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: clean, editing: false } : t)));
  }

  function cancelEdit(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, editing: false } : t)));
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-100 to-pink-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-orange-200 bg-white/90 p-5 shadow-xl md:p-8">
        <h1 className="text-3xl font-extrabold text-orange-600 md:text-4xl">⚡ Energy Todo Reminder</h1>
        <p className="mt-2 text-sm text-gray-600">添加任务、勾选完成状态、全选/全不选、编辑、删除，并自动保存到本地。</p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="输入新的待办..."
            className="flex-1 rounded-xl border-2 border-orange-300 px-4 py-3 outline-none transition focus:border-pink-400"
          />
          <button
            onClick={addTodo}
            className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            新增 Todo
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={selectAll} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600">
            全选
          </button>
          <button onClick={deselectAll} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-600">
            全不选
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-semibold">
          <div className="rounded-lg bg-orange-100 p-2 text-orange-700">总数：{stats.total}</div>
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">已完成：{stats.done}</div>
          <div className="rounded-lg bg-sky-100 p-2 text-sky-700">未完成：{stats.pending}</div>
        </div>

        <ul className="mt-5 space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggle(todo.id)}
              onDelete={() => removeOne(todo.id)}
              onStartEdit={() => startEdit(todo.id)}
              onSave={(text) => saveEdit(todo.id, text)}
              onCancel={() => cancelEdit(todo.id)}
            />
          ))}
        </ul>

        {todos.length === 0 && <p className="mt-8 text-center text-gray-500">还没有任务，先加一个让自己开冲 🚀</p>}
      </div>
    </main>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onStartEdit,
  onSave,
  onCancel,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(todo.text);

  return (
    <li className="rounded-xl border border-orange-200 bg-orange-50/40 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={todo.done} onChange={onToggle} className="h-5 w-5 accent-orange-500" />

          {!todo.editing ? (
            <span className={`text-base ${todo.done ? "text-gray-400 line-through" : "text-gray-800"}`}>{todo.text}</span>
          ) : (
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSave(draft)}
              className="rounded border border-orange-300 bg-white px-2 py-1"
            />
          )}
        </div>

        <div className="flex gap-2">
          {!todo.editing ? (
            <button onClick={onStartEdit} className="rounded bg-indigo-500 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-600">
              编辑
            </button>
          ) : (
            <>
              <button onClick={() => onSave(draft)} className="rounded bg-emerald-600 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-700">
                保存
              </button>
              <button onClick={onCancel} className="rounded bg-gray-400 px-3 py-1 text-sm font-semibold text-white hover:bg-gray-500">
                取消
              </button>
            </>
          )}

          <button onClick={onDelete} className="rounded bg-rose-500 px-3 py-1 text-sm font-semibold text-white hover:bg-rose-600">
            删除
          </button>
        </div>
      </div>
    </li>
  );
}
