import React, {
  useEffect
} from "react";


import useTyper from "./TyperRobot/useTyper"


function App() {
  const [text, start, current, state] = useTyper(({type, pauseFor, setHighlight,end, backspace, step, loop, stop}) => {
    type("hello")
    pauseFor(1000)
    type(" my name is Viktor")
    setHighlight(true)
    step(-1, 6, 500)
    pauseFor(2000)
    setHighlight(false)
    pauseFor(3000)
    stop()
    type("hello jesus")
    stop()
  })

  useEffect(() => {
    setTimeout(() => {

        start()
    },15000)
  },[])
  
  return (
    <div>
      <h1 style={{fontSize: "5em"}}>{text}</h1>
    </div>

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


    // useRef,
// Component,
// createContext,
// useContext,
// useState,
// useReducer,
// useCallback,
// useMemo
// import CursorBar from "./TyperRobot/CursorBar";
// import Settings from "./TyperRobot/Editor";