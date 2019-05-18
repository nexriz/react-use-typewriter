backspace_old = (val, del_speed=Settings.default.speed.delete) => {
    if(typeof del_speed !== "number") throw "del_speed argument needs to be a number"
    if(del_speed > 2000 || del_speed < 3) throw "del_speed can only be: (10 < del_speed < 10000)"
    console.log("X",this.state[this.state.length - 1].text)
    const text = this.state[this.state.length - 1].text

    const current = text.substring(0, this.state[this.state.length - 1].text.length - val)
    const left_over = this.state[this.state.length - 1].text.substring(this.state[this.state.length - 1].text.length + this.state.steps, this.state[this.state.length - 1].text.length - 1)
    this.state.push({
      action: "DEL", 
      text: current, 
      pause: Settings.default.pause, 
      speed: del_speed,
      position: this.position
    })

    return this
  }

  backspace_to_match_old = (regex, del_speed=Settings.default.speed.delete) => {
    const text = this.state[this.state.length - 1].text
    const val = text.length - text.match(regex).index
    const current = this.state[this.state.length - 1].text.substring(0, this.state[this.state.length - 1].text.length - val)

    this.state.push({
      action: "DEL", 
      text: current, 
      pause: Settings.default.pause, 
      speed: del_speed,
      position: this.position
    })


    return this
  }