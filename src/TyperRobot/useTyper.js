import { useEffect, useState, useRef, useCallback } from "react";

import Cursor from "./Cursor";
import Settings from "./Editor";

const cursorDefault = {
  backgroundColor: "#ff9a02e0",
  width: "0.04em",
  left: "0",
  top: "25%"
}

function _callTimeout(item, resolve, delay) {
  console.log(item.action, "-->", item[delay], delay)
  setTimeout(() => {
    resolve(item);
  }, item[delay]);
}

async function _callItem(item) {
  return new Promise((resolve, reject) => {
      if(item.pause > 0) 
        _callTimeout(item, resolve, "pause")
      else 
        _callTimeout(item, resolve, "speed")
      
  })
}

const _renderTyper = async (
  state,
  index,
  setIndex,
  setSteps,
  setShowbar,
  setIsMarking,
  setIsOn,
  isMarking
) => {
    const stateItem = state[index]  
      await _callItem(stateItem);
      if(stateItem.action === "MARK") {
        setIsMarking(prevIsMarking => stateItem.isMarking)
      }
      if (stateItem.action === "END") {
        setSteps(prevSteps => 0);
        setShowbar(prevShowbar => false);
        setIsMarking(prevIsMarking => false);
      }
      if (stateItem.action === "LOOP") {
        setIndex(prevIndex => 0);
        setSteps(prevSteps => 0);
        setShowbar(prevShowbar => true);
        setIsMarking(prevIsMarking => false);
        _renderTyper(
          state,
          index,
          setIndex,
          setSteps,
          setShowbar,
          setIsMarking,
          setIsOn,
          isMarking

        );
      }
      if(stateItem.action === "STOP") {
        setIsOn(false)
        return
      }
      if (stateItem.action === "STEP") {

          setSteps(prevSteps => prevSteps + stateItem.steps);
      }
      setIndex(
        prevIndex => {
          prevIndex += 1
          return prevIndex >= state.length ? prevIndex - 1 : prevIndex
        }
      );

};



function _createString(
  state,
  steps,
  index,
  isMarking,
  showbar,
  cursorStyle
) {
    const { action, text } = state[index]
    const sequence = text.split("").concat([""]);
    const copy = [...sequence];
    const char_index = sequence.length - 1 + steps;
    if (isMarking) {
      let left = copy.splice(char_index, Math.abs(steps) + 1);
      sequence.splice(
        char_index,
        0,
        Cursor(action, isMarking, showbar, cursorStyle, left)
      );
    } else {
      sequence.splice(
        char_index,
        0,
        Cursor(action, isMarking, showbar, cursorStyle)
      );
    }
    return sequence;
}

function _createSettings(writeCallback, Settings) {
  const settings = Settings.text("", 100);
  return (writeCallback(settings), settings.state);
}

// const saveCallback = setters => dependency => useCallback(() => {
//   for(let setter of setters)
//     setter[0](setter[1])
// }, dependency)

const useStateWithoutRerendering = initialState => {
  const state = useRef(initialState)
  const setState = useCallback(newState => {
    if(typeof newState === "function") {
      newState = newState(state.current)
    }
    state.current = newState
  },[])
  return [state.current, setState]
}

function useTyper(writeCallback) {
  const [state] = useState(_createSettings(writeCallback, Settings));
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useStateWithoutRerendering(0)
  const [showbar, setShowbar] = useState(true);
  const [isMarking, setIsMarking] = useStateWithoutRerendering(false);
  const [isOn, setIsOn] = useStateWithoutRerendering(true)

  const start = useCallback(() => {
    setIsOn(true)
    setIndex(prevIndex => prevIndex + 1)
  },[setIsOn])

  // const stop = saveCallback([[setIsOn, false]])([])
  
  useEffect(() => {
    console.log(steps)
  },[steps])

  useEffect(() => {
    _renderTyper(
      state,
      index,
      setIndex,
      setSteps,
      setShowbar,
      setIsMarking,
      setIsOn,
      isMarking
    );
  },[index])

  const sentence = _createString(state, steps, index, isMarking, showbar, cursorDefault)

  return [sentence, start, state[index], state]
}

export default useTyper;









// const { Types } = require("./Types");

// const { ADD, END, MARK, PAUSE, BACK, STEP } = Types




// async function _freeze(callback) {
//     return new Promise((resolve) =>  {
//         const timeOut = setTimeout(() => resolve(), 1*60*60*60)
//         const stop = () => (clearTimeout(timeOut), resolve)
//         callback && callback(stop)
//     })
// }



  // useCallback(() => {
  //   setIsOn(true)
  //   setIndex(prevIndex => prevIndex + 1)
  // },[])