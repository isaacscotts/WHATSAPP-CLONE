const ContextMenu=({coordinates,options,hide})=>{
  
    const handleClick=(e,callBack)=>{
      e.stopPropagation()
      callBack()
      hide()
    }
  return (
    <div className="absolute bg-[#233138] text-white"
    style={{top:coordinates.y,left:coordinates.x}}
    >
        <ul>
          {options.map(({name,callBack})=>(
            <li key={name} onClick={(e)=>handleClick(e,callBack)} className="px-2 pb-1">
              <span>{name}</span>
            </li>
          ))}
        </ul>
        </div>
  )
}

export default ContextMenu;