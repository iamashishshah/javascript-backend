import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [jokes, setJokes] = useState([]);

  useEffect(() => {
    axios
      .get("api/jokes")
      .then((response) => {
        setJokes(response.data);
      })
      .catch((error) => {
        console.log(`Got error: ${error}`);
      });
  });

  return (
    <>
      <h1>Full Stack Application</h1>
      <h3>Jokes: {jokes.length}</h3>

      {jokes.map((val) => (
        <div key={val.id}>
          <h3>{val.title}</h3>
          <p>{val.content}</p>
        </div>
      ))}
    </>
  );
}

export default App;
