"use client"
import { useEffect, useRef } from "react";

import ReactDom from "react-dom"
const PhotoPicker=({setImage,hide})=>{
    const inputFileRef=useRef(null)
    let interval;
    useEffect(()=>{
      inputFileRef.current.click()
      interval=setTimeout(()=>{
          hide(false)
      },5000)
      const handleChange=async (e)=>{
        const files=e.target.files
        const file=files[0]
        setImage(URL.createObjectURL(file))

      }

      inputFileRef.current.addEventListener("change",handleChange)

      return ()=>{
        if(inputFileRef.current)
        inputFileRef.current.removeEventListener("change",handleChange)
      }
    },[])
    const componet=(<input type="file" ref={inputFileRef} id="photo-picker"/>)
   return   ReactDom.createPortal(componet,document.getElementById("photo-picker-element"))
}
export default PhotoPicker;