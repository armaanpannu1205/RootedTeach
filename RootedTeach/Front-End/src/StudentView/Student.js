function Student({ student }) {
    return (
      <div className="student">
        <h2>{student.name}</h2>
        <p>Age: {student.age}</p>
        <p>Major: {student.major}</p>
      </div>
    );
  }
  
  export default Student;