import express from 'express'
const app = express()
const PORT = process.env.PORT || 3000

const jokes = [
    {
      id: 1,
      title: "Why did the scarecrow win an award?",
      content: "Because he was outstanding in his field!"
    },
    {
      id: 2,
      title: "Why don't scientists trust atoms?",
      content: "Because they make up everything!"
    },
    {
      id: 3,
      title: "What do you call fake spaghetti?",
      content: "An impasta!"
    },
    {
      id: 4,
      title: "Why did the math book look sad?",
      content: "Because it had too many problems."
    },
    {
      id: 5,
      title: "What do you call cheese that isn't yours?",
      content: "Nacho cheese!"
    }
  ];
  
app.get('/api/jokes/:jokeID', (req, res) =>{
    const jokeID = Number(req.params.jokeID)
    const joke = `${jokes[jokeID].title} \n${jokes[jokeID].content}`
    return res.send(joke)
})

app.get('/api/jokes', (req, res) =>{
  return res.json(jokes)
})

app.listen(PORT, ()=>{
    console.log(`Server started at http://localhost:${PORT}`)
})