const prompts = require('./prompts.js')

class Game{
  constructor(){
    this.currentPlayer = ''
    this.players = []
    this.prompt = ''
  }

  // add input client
  addPlayer (socket) {
    if(!this.players.length) {
      this.currentPlayer = socket.id
      this.setPrompt()
    }
    this.players.push(socket)
  }

  // remove input client
  removePlayer (id) {
    if(this.players.length === 1){
      this.players = []
      this.currentPlayer = ''
    } else {
      this.players = this.players.filter(d => d.id !== id)
    }
  }

  findPlayer (id) {
    return this.players.find(d => d.id === id)
  }

  allPlayers() {
    return this.players.map(d=>d.id)
  }

  next() {
    const currentPlayerIndex = this.players.findIndex(d => d.id === this.currentPlayer)
    const nextPlayerIndex = (currentPlayerIndex + 1) % this.players.length
    this.currentPlayer = this.players[nextPlayerIndex].id
  }

  getCurrentPlayer() {
    return this.currentPlayer
  }

  setPrompt() {
    const randomIndex = Math.floor(Math.random() * prompts.length)
    this.prompt = prompts[randomIndex]
  }

  getPrompt(){
    return this.prompt
  }

  printGameStatus() {
    console.log(`Queue length: ${this.players.length}`)
    console.log(`Queue: ${this.players.map(d=>d.id)}`)
    console.log(`Current player: ${this.getCurrentPlayer()}`)
    console.log(`Current prompt: ${this.getPrompt()}`)
    console.log(`----------------------------------------`)
  }
}

module.exports = Game