import { useState } from "react";
import logo from "./assets/images/logo-universal.png";
import "./App.css";
import { Greet } from "../wailsjs/go/main/App";

import Form from "./components/Form";
import Todo from "./components/Todo";
import Navbar from "./components/Navbar";
import ClippedDrawer from "./components/ClippedDrawer";

import { nanoid } from "nanoid";

const App = (props) => {
  const [resultText, setResultText] = useState(
    "Please enter your name below 👇"
  );
  const [name, setName] = useState("");
  const updateName = (e) => setName(e.target.value);
  const updateResultText = (result) => setResultText(result);

  function greet() {
    Greet(name).then(updateResultText);
  }

  function addTask(name) {
    const newTask = { id: `todo-${nanoid()}`, name, completed: false };
    setTasks([...tasks, newTask]);
  }

  const [tasks, setTasks] = useState(props.tasks);
  const taskList = tasks.map((task) => (
    <Todo
      id={task.id}
      name={task.name}
      completed={task.completed}
      key={task.id}
    />
  ));

  return (
    <div id="App" className="todoapp">
        <ClippedDrawer/>
        {/* <Navbar/> */}
        
      {/* <h1>代辦事項</h1>
      <Form addTask={addTask}></Form>
      <button type="button" className="btn toggle-btn" aria-pressed="true">
        <span className="visually-hidden">Show </span>
        <span>all</span>
        <span className="visually-hidden"> tasks</span>
      </button>
      <button type="button" className="btn toggle-btn" aria-pressed="true">
        <span className="visually-hidden">Show </span>
        <span>Active</span>
        <span className="visually-hidden"> tasks</span>
      </button>
      <button type="button" className="btn toggle-btn" aria-pressed="true">
        <span className="visually-hidden">Show </span>
        <span>Completed</span>
        <span className="visually-hidden"> tasks</span>
      </button>
      {taskList} */}
      {/* <Todo name="Eat" completed={true} id="todo-0" /> */}
      {/* <Todo name="Coding at 8:00pm" completed={true} id="todo-0" /> */}
    </div>
    // <div id="App">
    //     <img src={logo} id="logo" alt="logo"/>
    //     <div id="result" className="result">{resultText}</div>
    //     <div id="input" className="input-box">
    //         <input id="name" className="input" onChange={updateName} autoComplete="off" name="input" type="text"/>
    //         <button className="btn" onClick={greet}>Greet</button>
    //     </div>
    // </div>
  );
};

export default App;
