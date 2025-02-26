import {useState} from 'react';

const Form = (props) => {
    const [name, setName] = useState("Task");

    function handleChange(e) { //同步更新輸入值
      setName(e.target.value);
    }
    function handleSubmit(event) {
      event.preventDefault(); // 防止頁面重新載入
      props.addTask(name); // 傳遞輸入值給父元件
      setName(""); // 清空輸入框
    }
  
    return (
        <form onSubmit={handleSubmit}>
        <h2 className="label-wrapper">
          <label htmlFor="new-todo-input" className="label__lg">
            What needs to be done?
          </label>
        </h2>
        <input
          type="text"
          id="new-todo-input"
          className="input input__lg"
          name="text"
          autoComplete="off" //防止選擇填值
          value={name}
          onChange={handleChange}
        />
        <button type="submit" className="btn btn__primary btn__lg">
          Add
        </button>
      </form>
    )
  }
  
  export default Form;
  