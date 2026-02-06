import './App.css';
import Student from './StudentView/Student.js'
import Teacher from './TeacherView/Teacher.js'


function App() {
  return (
    <div className="App">
      <Student student={{ name: "Arman", age: 20, major: "CS" }} />
      <Teacher teacher={{ name: "Shige", age: 25, major: "CS" }} />
    </div>
  );
}

export default App;
