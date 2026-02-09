import './App.css';
import Student from './StudentView/Student.js'
import Teacher from './TeacherView/Teacher.js'
import Login from './LoginView/Login.js'
import {useState} from 'react'

function App() {
  const [logIn, setLogin] = useState(false);
  const handleClick = () => {
    setLogin(true);
  }
  return (
    <div className="App">

    <div>
      <Login />
    </div>
    </div>
  );
}

export default App;
