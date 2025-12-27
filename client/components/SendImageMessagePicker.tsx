'use client'
import { useEffect, useRef } from "react"
import ReactDom from "react-dom"
const SendMessagePicker=({onChange,setGrabPhoto})=>{
    const inputFileRef=useRef(null)
    useEffect(()=>{
        let interval;
    if(inputFileRef.current){
        inputFileRef.current.click()
        interval=setTimeout(()=>{
           setGrabPhoto(false)
        },3000)
        inputFileRef.current.addEventListener("change",onChange)
    }

    return ()=>{
        if(inputFileRef.current){
            inputFileRef.current.removeEventListener("change",onChange)
        }
    }
},[])
    const component=(<input type="file" ref={inputFileRef} id="photo-picker"/>)
  return ReactDom.createPortal(component,document.getElementById('photo-picker-element'))
}

export default SendMessagePicker;