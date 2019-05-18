import React, { useState, useEffect, useRef } from 'react';

const Style = () => ({
  display: "block",
  position: "absolute",
  height: "1.1em",
  width: "0.05em",
  top: "0.05em",
  marginLeft: "-0.01em",
  backgroundColor: "rgba(0,0,0,0.8)",
  transition: "opacity 0.2s"

})

function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}



function CursorBar(props){

  const [hidden,  setHidden] = useState(false)
  useInterval(() => void setHidden(props.notMoving && !hidden), 500)
  return (
      <span style={{display: "inline-block",position: "absolute", backgroundColor: props.isMarking ? "yellow" : "none"}}>
          <span style={{
              ...Style({left: props.left, top: props.top}), 
              backgroundColor: props.isMarking ? "" : props.backgroundColor,
              opacity: hidden || !props.showbar ? "0" : "1"}}/>      
              {props.char}
      </span>)
}



function Cursor(action, isMarking, showbar, cursorStyle, char) {
  return (
    <CursorBar
      key={"CursorBar"}
      notMoving={!(action === "STEP" || action === "BACK" || action === "ADD" || action === "END")}
      isMarking={isMarking}
      char={char}
      showbar={showbar}
      {...cursorStyle}

    />
  );
}

export default Cursor