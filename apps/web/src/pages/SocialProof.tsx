import React from "react";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "../components/layout/MobileNav";
import { DemoBanner } from "../components/layout/DemoBanner";
import { isLoggedIn } from "../services/auth";

export default function SocialProof(): React.ReactElement {
  const navigate = useNavigate();

  function handleContinue(): void {
    // Navigate to login if not logged in, otherwise to dashboard
    if (isLoggedIn()) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <DemoBanner />
      
      <div className="flex-1 flex flex-col items-center px-6 py-10 sm:px-6 max-w-[480px] mx-auto w-full">
        
        {/* SECTION 1 — PROFILE ILLUSTRATION */}
        <div
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '0 auto 24px auto',
            border: '3px solid #22c55e',
            boxShadow: '0 0 24px rgba(34,197,94,0.15)',
            flexShrink: 0,
          }}
        >
          <img
            src="/avatar.png"
            alt="Stree Astra User"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        </div>

        {/* SECTION 2 — TOP BADGE */}
        <div className="flex items-center gap-2 mb-7">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="w-4 h-4 text-[#4ade80]"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="text-[14px] font-[700] text-[#4ade80] tracking-[0.02em]">
            2M+ Strong Community
          </span>
        </div>

        {/* SECTION 3 — HEADING + SUBTITLE */}
        <div className="text-center mb-10">
          <h1 className="text-[36px] font-[800] text-white leading-[1.15] mb-4">
            Trusted by Thousands
          </h1>
          <p className="text-[16px] font-[400] text-[#94a3b8] leading-[1.6] max-w-[300px] mx-auto">
            Women everywhere feel more confident with STREE ASTRA by their side.
          </p>
        </div>

        {/* SECTION 3 — TESTIMONIAL CARDS */}
        <div className="w-full space-y-4 mb-8">
          
          {/* CARD 1 */}
          <div className="bg-[#1a2235] border border-white/8 rounded-[16px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <blockquote className="text-[15px] italic text-[#e2e8f0] leading-[1.7] mb-5">
              "STREE ASTRA changed how I commute at night. The live tracking feature gives my family peace of mind every single day."
            </blockquote>
            <div className="flex items-center gap-[14px]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c0392b] to-[#e67e22] flex items-center justify-center">
                <span className="text-white text-[16px] font-[700]">SJ</span>
              </div>
              <div>
                <div className="text-[16px] font-[700] text-white">Sarah Jenkins</div>
                <div className="text-[13px] font-[400] text-[#4ade80]">New York, NY</div>
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-[#1a2235] border border-white/8 rounded-[16px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <blockquote className="text-[15px] italic text-[#e2e8f0] leading-[1.7] mb-5">
              "The community safety alerts are incredibly accurate. I feel so much safer knowing what's happening around me."
            </blockquote>
            <div className="flex items-center gap-[14px]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#16a085] to-[#2ecc71] flex items-center justify-center">
                <span className="text-white text-[16px] font-[700]">ER</span>
              </div>
              <div>
                <div className="text-[16px] font-[700] text-white">Elena Rodriguez</div>
                <div className="text-[13px] font-[400] text-[#4ade80]">London, UK</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — CONTINUE BUTTON */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full h-[60px] bg-[#16a34a] text-white text-[18px] font-[700] rounded-[14px] border-none cursor-pointer transition-all duration-150 ease-out hover:bg-[#15803d] hover:scale-[1.01] active:scale-[0.99] mt-8"
        >
          Continue
        </button>
      </div>
      
      <MobileNav />
    </main>
  );
}
