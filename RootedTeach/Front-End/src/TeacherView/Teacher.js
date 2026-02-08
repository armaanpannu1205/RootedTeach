import React, { useState } from 'react'
function Teacher({ teacher }) {

  const [classes, setClasses] = useState(["English", "Math", "Science"]);
  const [newClass, setNewClass] = useState("");

  function handleInputChange(event){ //text box to type Class Name
    setNewClass(event.target.value);
  }

  function addClass(){

    if(newClass.trim() !== ""){
      setClasses(c =>[...c, newClass]);
      setNewClass("");
    }

  }

  function deleteClass(index){
    const updatedClass = classes.filter((_, i) => i !== index);
    setClasses(updatedClass);
  }

    return (
    <div className="teacher">

      <h1>Teacher Page</h1>

      <div> 
        <input
          type="text"
          placeholder="Add Class"
          value={newClass}
          onChange={handleInputChange}/>
          <button
            className="add-button"
            onClick={addClass}>
            Add 
          </button>
      </div> 

      <ol>
        {classes.map((classes, index) => 
          <li key={index}>
            <button className="text">
              {classes}

            </button>
            <button
              className="delete-button"
              onClick={() => deleteClass(index)}>
              Delete
            </button>
          

          </li>
        )}
      </ol>



    </div>);
  }
  
  export default Teacher; 