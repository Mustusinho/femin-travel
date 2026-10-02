import {ImageResponse} from 'next/og'
export const runtime='edge'
export const alt='FeminTravel — Thoughtful trips, beautifully planned'
export const size={width:1200,height:630}
export const contentType='image/png'
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:90,background:'linear-gradient(120deg,#fff9ef,#fce3eb,#e9e1f7)',color:'#302638'}}><div style={{fontSize:40,marginBottom:40}}>✦ FeminTravel</div><div style={{fontSize:76,maxWidth:900}}>Thoughtful trips, beautifully planned.</div><div style={{fontSize:28,marginTop:34}}>AI-powered travel planning for women and friends</div></div>,size)}
