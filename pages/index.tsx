import type { NextPage } from "next";
import { useEffect, useState, FormEvent } from "react";

interface ITodo {
  _id?: string;
  name: string;
  isCompleted: boolean;
}

const Home: NextPage = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [input, setInput] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/todo", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch todos");
        return res.json();
      })
      .then((data) => setTodos(data))
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
        alert("Failed to load todos. Please try again later.");
      });
    return () => controller.abort();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTodo = { name: input, isCompleted: false };
    try {
      const res = await fetch("/api/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      });
      if (!res.ok) throw new Error("Failed to add todo");
      const created = await res.json();
      setTodos((prev) => [...prev, created]);
      setInput("");
    } catch (err) {
      console.error(err);
      alert("Failed to add todo. Please try again.");
    }
  };

  const handleDelete = async (_id?: string) => {
    if (!_id) return;
    try {
      const res = await fetch("/api/todo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id }),
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      setTodos((prev) => prev.filter((todo) => todo._id !== _id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete todo. Please try again.");
    }
  };

  const handleEdit = (idx: number, currentValue: string) => {
    setEditIdx(idx);
    setEditValue(currentValue);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = async (idx: number) => {
    const todo = todos[idx];
    if (!todo._id) return;
    try {
      const res = await fetch("/api/todo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: todo._id,
          name: editValue,
          isCompleted: todo.isCompleted,
        }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      const updated = await res.json();
      setTodos((prev) => prev.map((t, i) => (i === idx ? updated : t)));
      setEditIdx(null);
      setEditValue("");
    } catch (err) {
      console.error(err);
      alert("Failed to update todo. Please try again.");
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditValue("");
  };

  const handleToggleCompleted = async (idx: number) => {
    const todo = todos[idx];
    if (!todo._id) return;
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };
    try {
      const res = await fetch("/api/todo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: todo._id,
          name: todo.name,
          isCompleted: updatedTodo.isCompleted,
        }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      const updated = await res.json();
      setTodos((prev) => prev.map((t, i) => (i === idx ? updated : t)));
      console.log(
        `Todo '${updatedTodo.name}' isCompleted: ${updatedTodo.isCompleted}`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update todo. Please try again.");
    }
  };

  return (
    <div className="app-container">
      <h1 className="todo-header">Todo List</h1>
      <table className="todo-table">
        <tbody>
          {todos.map((todo, idx) => (
            <tr key={todo._id || idx} className="todo-row">
              <td className="todo-cell">
                <div className="todo-item">
                  <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={() => handleToggleCompleted(idx)}
                    className="todo-checkbox"
                  />
                  {editIdx === idx ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={handleEditChange}
                        className="todo-input"
                      />
                      <button
                        onClick={() => handleEditSave(idx)}
                        className="todo-btn todo-btn-save"
                        title="Save">
                        💾
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="todo-btn todo-btn-cancel"
                        title="Cancel">
                        ✖️
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`todo-text${
                          todo.isCompleted ? " todo-completed" : ""
                        }`}>
                        {todo.name}
                      </span>
                      <div className="todo-btns">
                        <button
                          onClick={() => handleEdit(idx, todo.name)}
                          className="todo-btn todo-btn-edit"
                          title="Edit"
                          disabled={editIdx !== null}>
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(todo._id)}
                          className="todo-btn todo-btn-delete"
                          title="Delete">
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Todo name"
            value={input}
            onChange={handleInputChange}
            className="todo-input"
          />
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  );
};

export default Home;
