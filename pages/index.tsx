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
  const [editId, setEditId] = useState<string | null>(null);
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

  const handleEdit = (_id: string, currentValue: string) => {
    setEditId(_id);
    setEditValue(currentValue);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = async (_id: string) => {
    const todo = todos.find((t) => t._id === _id);
    if (!todo || !todo._id) return;
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
      setTodos((prev) => prev.map((t) => (t._id === _id ? updated : t)));
      setEditId(null);
      setEditValue("");
    } catch (err) {
      console.error(err);
      alert("Failed to update todo. Please try again.");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditValue("");
  };

  const handleToggleCompleted = async (_id?: string) => {
    const todo = todos.find((t) => t._id === _id);
    if (!todo || !todo._id) return;
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
      setTodos((prev) => prev.map((t) => (t._id === _id ? updated : t)));
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
          {todos.map((todo) => (
            <tr key={todo._id} className="todo-row">
              <td className="todo-cell">
                <div className="todo-item">
                  <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={() => handleToggleCompleted(todo._id)}
                    className="todo-checkbox"
                  />
                  {editId === todo._id ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={handleEditChange}
                        className="todo-input"
                      />
                      <button
                        onClick={() => handleEditSave(todo._id!)}
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
                          onClick={() => handleEdit(todo._id!, todo.name)}
                          className="todo-btn todo-btn-edit"
                          title="Edit"
                          disabled={editId !== null}>
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
