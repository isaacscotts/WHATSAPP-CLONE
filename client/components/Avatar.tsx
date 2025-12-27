import Image from 'next/image'
import { useState } from 'react';
import { FaCamera } from 'react-icons/fa6';
import ContextMenu from './ContextMenu';
import CapturePhoto from './CapturePhoto';
import PhotoLibrary from './PhotoLibrary';
import PhotoPicker from './PhotoPicker';
const Avatar=({type,image,setImage})=>{
  const [hover,setHover]=useState(false)
  const [isContextMenuVisible,setIsCOntextMenuVisible]=useState(false)
  const [isCapturePhoto,setIsCapturePhoto]=useState(false)
  const [grabPhoto,setGrabPhoto]=useState(false)
  const [showPhotoLibrary,setShowPhotoLibrary]=useState(false)
  const [contextMenuCoordinates,setContextMenuCoordinates]=useState({
    x:0,
    y:0
  })
  const showContextMenu=(e)=>{
     e.stopPropagation()
     setContextMenuCoordinates({
      x:e.pageX,
      y:e.pageY
     })
     setIsCOntextMenuVisible(true)
  }

  const contextMenuOptions=[
    {name:'Take Photo',callBack:()=>{setIsCapturePhoto(true)}},
     {name:'Choose From Library',callBack:()=>{setShowPhotoLibrary(true)}},
      {name:'Upload Photo',callBack:()=>{setGrabPhoto(true)}},
       {name:'Remove Photo',callBack:()=>{setImage("/default_avatar.png")}}
  ]
  return (
    <>
    <div className='flex flex-col justify-center items-center'>
        {type==="xl" && (
            <div className='relative w-60 h-60'
               onMouseEnter={()=>setHover(true)}
                  onMouseLeave={()=>setHover(false)}
            >
                <Image src={image} fill alt="avatar" className='rounded-full'/>
                <div
                className={`absolute bg-amber-800/30 flex flex-col justify-center items-center rounded-full bottom-o top-0 w-60 h-60 ${hover?"visible":'hidden'}`}
                 onClick={(e)=>showContextMenu(e)}
                >

                  <FaCamera size={37}/>
                  <span className='text-white'>Upload <br/> Profile <br/> Picture</span>
                  </div>
            </div>
          
        )}

        {type==="sm" && (
          <div className='relative w-16 h-16'>
            <Image className='rounded-full' src={image ||null} fill alt="profile pic"/>
          </div>
        )}
        {type==="c" && (
          <div className='relative w-30 h-30'>
            <Image className='rounded-full' src={image ||null} fill alt="profile pic"/>
          </div>
        )}
      
    </div>
    {isContextMenuVisible && (<ContextMenu hide={setIsCOntextMenuVisible} options={contextMenuOptions} coordinates={contextMenuCoordinates}/>)}
    {isCapturePhoto && (<CapturePhoto setImage={setImage} hide={setIsCapturePhoto}/>)}
    {showPhotoLibrary && (<PhotoLibrary setImage={setImage} hide={setShowPhotoLibrary}/>)}
    {grabPhoto && (<PhotoPicker setImage={setImage} hide={setGrabPhoto}/>)}
    </>
  )
}

export default Avatar;