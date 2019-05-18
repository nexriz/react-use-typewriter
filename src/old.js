import React, {
    Component,
    createContext,
    useContext,
    useRef,
    useEffect,
    useState,
    useReducer,
    useCallback,
    useMemo
  } from "react";
  
  // import CursorBar from "./TyperRobot/CursorBar";
  // import Settings from "./TyperRobot/Editor";
  import useTyper from "./TyperRobot/useTyper"
  
  const Type = {
    ADD: "ADD",
    END: "END",
    STEP: "STEP",
    BACK: "BACK",
    MARK: "MARK",
    PAUSE: "PAUSE"
  }
  
  const { ADD, END, STEP, BACK, MARK, PAUSE } = Type
  
  const initState = {
    count: 0,
    steps: 0,
    pivot: 0,
    index: 0,
    isMarking: false,
    text: []
  };
  
  
  const cursorDefault = {
    backgroundColor: "#ff9a02e0",
    width: "0.04em",
    left: "0",
    top: "25%"
  };
  
  
  function Cursor(action, isMarking, cursorStyle, char) {
    return (
      <CursorBar
        key={"CursorBar"}
        notMoving={!(action === "STEP" || action === "BACK" || action === "ADD")}
        isMarking={isMarking}
        char={char}
        {...cursorStyle}
      />
    );
  }
  
  function build_string(state, current, cursorStyle) {
    const { text, count, index, isMarking } = state;
    console.log("build", state)
    const { action } = current
    if (action === "END") {
      const sequence = [...text[index].text.substring(0, count)];
      const char_index = sequence.length + state.steps - 1;
      sequence.splice(char_index - 1, 0, Cursor(action, isMarking, cursorStyle, sequence[char_index]));
      return sequence;
    } else {
      const sequence = text[index].text.split("");
      sequence.push("");
      const copy = [...sequence];
      const char_index = sequence.length - 1 + state.steps;
      if (state.isMarking) {
        let left = copy.splice(char_index, Math.abs(state.steps) + 1);
        sequence.splice(char_index, 0, Cursor(action, isMarking, cursorStyle, left));
      } else {
        sequence.splice(char_index, 0, Cursor(action, isMarking, cursorStyle));
      }
      return sequence;
    }
  }
  
  const seeTime = direction =>
    function() {
      if (direction == 0) return this.state.text[this.state.index];
      else {
        if (this.state.text[this.state.index + direction] === undefined) {
          return this.state.text[0];
        } else {
          return this.state.text[this.state.index + direction];
        }
      }
    };
  
  
  
  
  
  
  
  class TyperRobot extends Component {
    state = initState
    steps = 0;
  
    cursorDefault = cursorDefault
  
    prev = seeTime(-1);
    current = seeTime(0);
    next = seeTime(1);
  
    init = () => {
      const write = this.props.write;
      const settings = Settings.text("", 10);
      write(settings);
      const splitSentence = [].concat(...settings.state);
      this.steps = splitSentence.length;
      return { text: splitSentence };
    };
  
    componentWillMount() {
      this.cursorDefault = { ...this.cursorDefault, ...this.props.cursor };
      this.setState(this.init);
    }
    componentDidMount() {
      setTimeout(
        this.currentScript(this.state.text[this.state.index].action),
        this.props.delay
      );
    }
  
    currentScript = action => {
      switch (action) {
        case "STEP":
          return this.stepper;
        case "END":
          return this.ending;
        default:
          return this.typer;
      }
    };
  
    typer = () => {
      if (this.next().action === this.current().action) {
        setTimeout(this.currentScript(this.next().action), this.current().speed);
        this.setState({ index: this.state.index + 1 });
      } else {
        setTimeout(() => {
          setTimeout(this.currentScript(this.next().action), this.next().speed);
          this.setState({
            index: this.state.index + 1,
            isMarking: this.current().isMarking
          });
        }, this.current().pause);
      }
    };
  
    stepper = () => {
      const { text, steps } = this.current();
      const steppers = { steps: this.state.steps + steps };
      this.setState(steppers);
      this.setState(state => {
        if (this.next().action === this.current().action) {
          setTimeout(
            this.currentScript(this.next().action),
            this.current().speed
          );
          return { index: this.state.index + 1 };
        } else {
          setTimeout(() => {
            setTimeout(this.currentScript(this.next().action), this.next().speed);
            this.setState({ index: this.state.index + 1 });
          }, this.current().pause);
        }
        return;
      });
    };
  
    ending = () => {
      const reset = { count: 0, steps: 0, pivot: 0, isMarking: false };
      if (this.state.count > this.checkIndex()) {
        this.setState({ count: this.state.count - 1 });
        let delete_speed = this.state.text[this.state.index + 1]
          ? this.state.text[this.state.index + 1].speed
          : this.state.text[this.state.index].speed;
        setTimeout(this.ending, delete_speed);
      } else {
        this.setState(state => {
          if (state.index < this.state.text.length - 1)
            return { index: state.index + 1, ...reset };
          else return { index: 0, ...reset };
        });
        setTimeout(
          this.currentScript(this.current().action),
          this.state.text[this.state.index].delay || 100
        );
      }
    };
  
    checkIndex = () => {
      const len = this.state.text[this.state.index].length - 1;
      if (
        this.state.text[this.state.index + 1] === undefined ||
        this.state.index + 1 > len ||
        this.current().action === "END"
      ) {
        return 0;
      } else {
        return this.state.text[this.state.index + 1].text.length;
      }
    };
  
    render() {
      return <>{build_string(this.state, this.current(), this.cursorDefault)}</>;
    }
  }
  
  
  function callTimeout(item, resolve, delay) {
    setTimeout(() => {
      console.log("test", item)
      resolve(item)
    }, item[delay])
  }
  
  async function call_item(item) {
    return new Promise((resolve, reject) => {
      if(item.pause > 0)
        callTimeout(item, resolve, "pause")
      else
        callTimeout(item, resolve, "speed")
    })
  } 
  
  
  const init = async ([state], [,setIndex]) => {
    do {
      for(let item of state) {
        await call_item(item)
        setIndex(prev => {
          prev += 1
          return (prev >= state.length) ? 0 : prev
        })
      }
    } while(false)
  }
  
  function create_string(text, count, steps, index, isMarking, action, cursorStyle) {
    console.log("build")
    if(action === "END") return 
    if (action === "END") {
      const sequence = [...text[index].text.substring(0, count)];
      const char_index = sequence.length + steps - 1;
      sequence.splice(char_index - 1, 0, Cursor(action, isMarking, cursorStyle, sequence[char_index]));
      return sequence;
    } else {
      const sequence = text[index].text.split("");
      sequence.push("");
      const copy = [...sequence];
      const char_index = sequence.length - 1 + steps;
      if (isMarking) {
        let left = copy.splice(char_index, Math.abs(steps) + 1);
        sequence.splice(char_index, 0, Cursor(action, isMarking, cursorStyle, left));
      } else {
        sequence.splice(char_index, 0, Cursor(action, isMarking, cursorStyle));
      }
      return sequence;
    }
  }
  
  function createSettings(writeCallback, Settings) {
    const settings = Settings.text("", 100)
    writeCallback(settings)
    return settings.state
  }
  
  
  function useTyperr(writeCallback) {
    const [state, setState] = useState(createSettings(writeCallback, Settings))
    const [count, setCount] = useState(0)
    const [steps, setSteps] = useState(0)
    const [index, setIndex] = useState(0)
    const [isMarking, setIsMarking] = useState(false)
  
    useEffect(() => {
      init([state, setState], [index, setIndex])
    },[])
  
    return create_string(state, state[index].text.length, 0, index, false, state[index].action, cursorDefault)
  }
  
  function App() {
    const m = useTyper(({type, pauseFor, end, backspace}) => {
      type("hello")
      pauseFor(3000)
      type(" my name is Viktor")
      pauseFor(1000)
      end()
    })
  
    return (
      <div>
        <h1>{m}</h1>
      </div>
      // <h1 style={{ 
      //   textAlign: "left", 
      //   fontSize: "3em", 
      //   marginLeft: 100 
      // }}>
      //   <TyperRobot
      //     loop
      //     cursor={{
      //       backgroundColor: "#ff9a02e0",
      //       width: "0.04em",
      //       top: "20%"
      //     }}
      //     write={({ type, pauseFor, backspace, end, removeAll }) => {
      //       type("heej test");
      //       pauseFor(3000);
      //       // removeAll();
      //       backspace(5);
      //       pauseFor(2000)
      //       type("hello", 500)
      //       pauseFor(1300)
      //       end()
      //     }}
      //   />
      // </h1>
    );
  }
  
  export default App;
  
  
  
  
            // return [
            //   // type("Hej mitt namn är groot", 30)
            //   //   .pauseFor(1000)
            //   //   .highlight(true)
            //   //   .step(-1, 5, 100)
            //   //   .pauseFor(2000)
  
            //   //   .highlight(false)
            //   //   .step(0)
            //   //   .pauseFor(2000)
            //   //   .step(-1, 5)
            //   //   .backspace_to_match(/Hej/)
            //   //   .add("I am ", 30)
            //   //   .pauseFor(1000)
            //   //   .step(5)
            //   //   .pauseFor(1000)
            //   //   .end()
            //   // type("h3j mitt namn är groot").pauseFor(2000)
            //   // .step(-5)
            //   // .removeAll()
            //   // .step(5).pauseFor(2000)
            //   // .end()
            // ];