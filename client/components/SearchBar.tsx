import { IoSearchSharp } from "react-icons/io5";
import { IoFilterSharp } from "react-icons/io5";
const SearchBar=()=>{
    return (
        <div className=" relative flex text-white justify-center ">
            <input type="text" placeholder="Search or Start a new Chat" className="focus:outline-none pl-10 p-1 bg-black w-[70%] rounded text-white"/>
            <div className="absolute top-[30%] left-10 text-white"><IoSearchSharp/></div>

            <div className="pl-5"><IoFilterSharp size={37}/></div>
         </div>
    )
}

export default SearchBar;