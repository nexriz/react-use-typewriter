const initialState = {
  delay: 0,
  pause: 0,
  speed: {
    delete: 100,
    add: 100,
    step: 400
  },
  position: 0
};




function spliceString(str, index, count, items) {
    const arr = str.split("");
    if (items) arr.splice(index, count, items);
    else arr.splice(index, count);
    return arr.join("");
  }



const createStateItem = (action, text, pause, speed, position) => ({
    action,
    text,
    pause,
    speed,
    position,
})


class Editor {
  pauseFor = pauseMs => {
    this.state.push(
        createStateItem("PAUSE", this.state[this.state.length - 1].text, pauseMs, 0, this.position)
    );
    this.state[this.state.length - 1].pause = pauseMs;
    return this;
  };
  end = () => {
    this.position = 0;
    this.state.push({
      action: "END",
      text: "",
      pause: 0,
      ...Settings.default,
      speed: Settings.default.speed.delete,
      position: this.position
    });
    return this.state;
  };
  stop = () => {
    const speed = 0
    this.state.push(
        createStateItem("STOP", this.state[this.state.length - 1].text, speed, 0, this.position)
    );
    return this.state;
  };
}



export default class Settings extends Editor {
  static default = {
    delay: 0,
    pause: 0,
    speed: {
      delete: 100,
      add: 100,
      step: 400
    },
    position: 0
  };

  position = Settings.default.position;

  constructor(start) {
    super();
    this.state = start;
  }

  static text = (str, add_speed = Settings.default.speed.add) => {

    const state = [
      {
        action: "ADD",
        text: "",
        pause: Settings.default.pause,
        speed: add_speed,
        position: Settings.default.position
      }
    ];

    for (let char of str) {
      const text = state[state.length - 1].text;
      state.push({
        action: "ADD",
        text: spliceString(
          text,
          text.length + Settings.default.position,
          0,
          char
        ),
        pause: Settings.default.pause,
        speed: add_speed,
        position: Settings.default.position
      });
    }
    return new Settings(state);
  };

  type = (str, add_speed = Settings.default.speed.add) => {

    for (let char of str) {
      const text = this.state[this.state.length - 1].text;
      this.state.push({
        action: "ADD",
        text: spliceString(text, text.length + this.position, 0, char),
        pause: Settings.default.pause,
        speed: add_speed,
        position: this.position
      });
    }
    return this;
  };

  loop = () => {
    this.state.push({
      action: "LOOP",
      text: this.state[this.state.length - 1].text,
      pause: Settings.default.pause,
      position: this.position
    });

    return this;
  };
  setHighlight = isMarking => {
    this.state.push({
      action: "MARK",
      text: this.state[this.state.length - 1].text,
      pause: Settings.default.pause,
      position: this.position,
      isMarking
    });

    return this;
  };

  backspace = (times, del_speed = Settings.default.speed.delete) => {
    while (times--) {
      const text = this.state[this.state.length - 1].text;
      const fresh = spliceString(text, text.length - 1 + this.position, 1);
      this.state.push({
        action: "BACK",
        text: fresh,
        pause: Settings.default.pause,
        speed: del_speed,
        position: this.position
      });
    }
    return this;
  };

  removeAll = (del_speed = Settings.default.speed.delete) => {
    let times =
      this.state[this.state.length - 1].text.length - 1 + this.positon;
    // console.log("times", times, this.position);
    while (times--) {
      const text = this.state[this.state.length - 1].text;
      const fresh = spliceString(text, text.length - 1 + this.position, 1);
      this.state.push({
        action: "BACK",
        text: fresh,
        pause: Settings.default.pause,
        speed: del_speed,
        position: this.position
      });
    }
    return this;
  };

  backspace_to_match = (regex, del_speed = Settings.default.speed.delete) => {
    const text = this.state[this.state.length - 1].text;
    const length = text.length - 1 + this.position;
    let how_far = length - text.match(regex).index + 1;
    while (how_far--) {
      const text = this.state[this.state.length - 1].text;
      const fresh = spliceString(text, text.length - 1 + this.position, 1);
      this.state.push({
        action: "BACK",
        text: fresh,
        pause: Settings.default.pause,
        speed: del_speed,
        position: this.position
      });
    }
    return this;
  };

  clear = () => {
    const current = this.state[this.state.length - 1].text.substring(0, 0);
    this.state.push({
      action: "CLEAR",
      text: current,
      pause: Settings.default.pause,
      speed: Settings.default.speed.delete,
      position: this.position
    });
    return this;
  };

  step = (steps, times = 1, step_speed = Settings.default.speed.step) => {

    if (steps === 0) {
      this.state.push({
        action: "STEP",
        text: this.state[this.state.length - 1].text,
        pause: Settings.default.pause,
        speed: step_speed,
        position: 0,
        steps: Math.abs(this.position)
      });
      this.position = 0;
      return this;
    }

    while (times--) {
      this.position += steps;
      this.state.push({
        action: "STEP",
        text: this.state[this.state.length - 1].text,
        pause: Settings.default.pause,
        speed: step_speed,
        position: this.position,
        steps
      });
    }

    return this;
  };
}
