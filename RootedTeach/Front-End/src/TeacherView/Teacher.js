function Teacher({ teacher }) {
    return (
      <div className="teacher">
        <h2>{teacher.name}</h2>
        <p>Age: {teacher.age}</p>
        <p>Subject: {teacher.subject}</p>
      </div>
    );
  }
  
  export default Teacher;