import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'

const container = document.getElementById('root')

const root = createRoot(container)


const DATA = [
    { id: "todo-0", name: "Eat", completed: true },
    { id: "todo-1", name: "Sleep", completed: false },
    { id: "todo-2", name: "Repeat", completed: false },
    { id: "todo-3", name: "Coding at 8:00pm", completed: false },
    
  ];

root.render(
    <React.StrictMode>
        <App tasks={DATA}/>
    </React.StrictMode>
)
