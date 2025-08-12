"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "next-todos:v1";

function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Todo[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(t => typeof t.id === "string" && typeof t.text === "string")
      .map(t => ({ ...t, completed: !!t.completed, createdAt: (t as any).createdAt ?? Date.now() }));
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // ignore storage errors
  }
}

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const filtered = useMemo(() => {
    const base =
      filter === "active" ? todos.filter(t => !t.completed) :
      filter === "completed" ? todos.filter(t => t.completed) :
      todos;
    const q = query.trim().toLowerCase();
    return q ? base.filter(t => t.text.toLowerCase().includes(q)) : base;
  }, [todos, filter, query]);

  function addTodo(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const t: Todo = { id: crypto.randomUUID(), text: trimmed, completed: false, createdAt: Date.now() };
    setTodos(prev => [t, ...prev]);
  }

  function toggle(id: string) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function remove(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function edit(id: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return remove(id);
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, text: trimmed } : t)));
  }

  function clearCompleted() {
    setTodos(prev => prev.filter(t => !t.completed));
  }

  const remaining = todos.filter(t => !t.completed).length;

  return (
    <div className="card">
      <form
        className="add"
        onSubmit={e => {
          e.preventDefault();
          if (!inputRef.current) return;
          addTodo(inputRef.current.value);
          inputRef.current.value = "";
          inputRef.current.focus();
        }}
      >
        <input ref={inputRef} placeholder="What needs to be done?" aria-label="New todo" />
        <button type="submit" className="primary">Add</button>
      </form>

      <div className="controls">
        <div className="filters" role="tablist" aria-label="Filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
            role="tab"
            aria-selected={filter === "all"}
          >All</button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
            role="tab"
            aria-selected={filter === "active"}
          >Active</button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
            role="tab"
            aria-selected={filter === "completed"}
          >Completed</button>
        </div>
        <input
          className="search"
          placeholder="Search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search todos"
        />
      </div>

      <ul className="list">
        {filtered.map(todo => (
          <TodoItem key={todo.id} todo={todo} onToggle={toggle} onRemove={remove} onEdit={edit} />)
        )}
      </ul>

      <div className="footerRow">
        <span>{remaining} item{remaining === 1 ? "" : "s"} left</span>
        <button onClick={clearCompleted} disabled={todos.every(t => !t.completed)}>
          Clear completed
        </button>
      </div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onRemove, onEdit }: {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    setText(todo.text);
  }, [todo.text]);

  return (
    <li className="item">
      <label className="checkbox">
        <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
        <span />
      </label>

      {editing ? (
        <form
          className="editForm"
          onSubmit={e => {
            e.preventDefault();
            onEdit(todo.id, text);
            setEditing(false);
          }}
        >
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={() => { onEdit(todo.id, text); setEditing(false); }}
            aria-label="Edit todo"
          />
        </form>
      ) : (
        <button
          className={"text" + (todo.completed ? " done" : "")}
          onDoubleClick={() => setEditing(true)}
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {todo.text}
        </button>
      )}

      <button className="remove" onClick={() => onRemove(todo.id)} aria-label="Delete todo">×</button>
    </li>
  );
}
