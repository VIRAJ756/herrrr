import React, { useState, useEffect } from "react";

interface FakeCallScreenProps {
  callerName: string;
  onEnd: () => void;
}

export function FakeCallScreen({ callerName = "Mom 👩", onEnd }: FakeCallScreenProps): React.ReactElement {
  const [callState, setCallState] = useState<"ringing" | "connected">("ringing");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCallState("connected"), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (callState !== "connected") return;
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s/60).toString().padStart(2,"0");
    const sec = (s%60).toString().padStart(2,"0");
    return `${m}:${sec}`;
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:99999,
      background:"linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"space-between",
      padding:"60px 32px 48px", fontFamily:"'Inter',sans-serif",
    }}>
      <div style={{ textAlign:"center", flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{
          width:"96px", height:"96px", borderRadius:"50%",
          background:"rgba(255,255,255,0.15)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"40px", marginBottom:"20px",
          border:"3px solid rgba(255,255,255,0.2)",
          animation: callState==="ringing" ? "ringPulse 1.5s infinite" : "none",
        }}>👩</div>
        <div style={{ fontSize:"28px", fontWeight:600, color:"white", marginBottom:"8px" }}>{callerName}</div>
        <div style={{ fontSize:"16px", color: callState==="ringing" ? "#94A3B8" : "#00E5A0", marginBottom:"4px" }}>
          {callState==="ringing" ? "Incoming call..." : formatDuration(duration)}
        </div>
        {callState==="ringing" && <div style={{fontSize:"13px",color:"#4B5563"}}>Mobile</div>}
      </div>

      {callState==="connected" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"24px", marginBottom:"48px", width:"100%", maxWidth:"280px" }}>
          {[
            { icon: isMuted?"🔇":"🎙", label: isMuted?"Unmute":"Mute", action:()=>setIsMuted(m=>!m) },
            { icon:"⌨️", label:"Keypad", action:()=>{} },
            { icon: isSpeaker?"🔊":"🔈", label:"Speaker", action:()=>setIsSpeaker(s=>!s) },
          ].map(btn=>(
            <div key={btn.label} onClick={btn.action} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", cursor:"pointer" }}>
              <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>{btn.icon}</div>
              <span style={{ fontSize:"11px", color:"#94A3B8" }}>{btn.label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"flex", gap:"48px", alignItems:"center" }}>
        {callState==="ringing" ? (
          <>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
              <button onClick={onEnd} style={{ width:"68px", height:"68px", borderRadius:"50%", background:"#FF3B5C", border:"none", cursor:"pointer", fontSize:"28px" }}>📵</button>
              <span style={{ fontSize:"12px", color:"#94A3B8" }}>Decline</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
              <button onClick={()=>setCallState("connected")} style={{ width:"68px", height:"68px", borderRadius:"50%", background:"#00E5A0", border:"none", cursor:"pointer", fontSize:"28px" }}>📞</button>
              <span style={{ fontSize:"12px", color:"#94A3B8" }}>Accept</span>
            </div>
          </>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
            <button onClick={onEnd} style={{ width:"68px", height:"68px", borderRadius:"50%", background:"#FF3B5C", border:"none", cursor:"pointer", fontSize:"28px" }}>📵</button>
            <span style={{ fontSize:"12px", color:"#94A3B8" }}>End Call</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ringPulse {
          0%{box-shadow:0 0 0 0 rgba(255,255,255,0.3)}
          70%{box-shadow:0 0 0 20px rgba(255,255,255,0)}
          100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}
        }
      `}</style>
    </div>
  );
}

