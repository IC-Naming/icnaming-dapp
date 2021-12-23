import React from "react";
import { Link } from "react-router-dom";
export const Error: React.FC = () => {
  return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',flexDirection:'column',justifyContent:'center',color:"#fff"}}>
      <h1 style={{fontSize:'1.2rem',marginBottom:'1rem'}}>Sorry, the page you visited does not exist.</h1>
      <Link to="/" style={{cursor: 'pointer'}}>Back Home</Link>
    </div>
  )
}