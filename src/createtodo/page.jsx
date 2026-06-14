"use client";

import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState([]);

  // Add Todo
  const addTodo = async () => {
    if (!title.trim()) {
      alert("Please enter a todo");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      const data = await response.json();

      console.log(data);

      alert("Todo Added Successfully!");

      setTitle("");

      // Refresh the list
      viewTodo();
    } catch (error) {
      console.log(error);
      alert("Failed to add todo");
    }
  };

  // View All Todos
  const viewTodo = async () => {
    try {
      const response = await fetch("http://localhost:5000/todos/todos");

      const data = await response.json();

      console.log(data);

      setTodos(data);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch todos");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">
        Todo App
      </h1>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Enter Todo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded mr-2"
        />

        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Todo
        </button>

        <button
          onClick={viewTodo}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          View All Todos
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3">
          Todo List
        </h2>

        {todos.length === 0 ? (
          <p>No todos found.</p>
        ) : (
          <ul>
            {todos.map((todo) => (
              <li
                key={todo._id}
                className="border p-3 rounded mb-2 flex justify-between"
              >
                <div>
                  <p>
                    <strong>Title:</strong> {todo.title}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {todo.completed ? "Completed" : "Pending"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}