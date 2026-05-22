'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)

  const menuItems = [
    {
      path: '/roles',
      title: 'Register Roles',
      description: 'Authorize and register partners participating in the supply chain network (RMS, MAN, DIS, RET)',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
      hoverGlow: 'hover:border-blue-500 hover:shadow-blue-500/10',
    },
    {
      path: '/addmed',
      title: 'Order Materials',
      description: 'Initiate and register new material shipments, buying raw materials on the Blockchain',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      hoverGlow: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
    },
    {
      path: '/supply',
      title: 'Control Chain',
      description: 'Manage and trigger transaction transitions of materials through the physical supply stages',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400',
      hoverGlow: 'hover:border-orange-500 hover:shadow-orange-500/10',
    },
    {
      path: '/track',
      title: 'Track Item',
      description: 'Trace product origin details, view vertical timeline history, and generate QR code information',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      gradient: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      hoverGlow: 'hover:border-purple-500 hover:shadow-purple-500/10',
    },
  ]

  const supplyChainFlow = [
    { step: '1', label: 'Ordered', icon: '📦', desc: 'Order Placed' },
    { step: '2', label: 'Raw Materials', icon: '🌱', desc: 'RMS Supply' },
    { step: '3', label: 'Manufactured', icon: '🏭', desc: 'Manufacturing' },
    { step: '4', label: 'Distributed', icon: '🚚', desc: 'Distribution' },
    { step: '5', label: 'Retail & Sold', icon: '🏪', desc: 'Final Sale' },
  ]

  return (
    <div className="space-y-12">
      {/* Overview Introduction */}
      <div className="text-center space-y-5 max-w-3xl mx-auto py-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 animate-pulse-slow">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">VeloChain </span>
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Supply Chain</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
          Monitor and track product transparency, shipment logistics, and material verification in real-time on a decentralized Blockchain network.
        </p>
      </div>

      {/* Sơ đồ tiến trình quy trình chuỗi */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-200 text-center tracking-wide uppercase">Supply Chain Workflow</h2>
        
        <div className="glass-card rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-pink-500/5 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 md:gap-4 relative z-10">
            {supplyChainFlow.map((item, index) => (
              <div key={item.step} className="flex-1 flex flex-col items-center justify-between text-center relative group">
                <div className="flex flex-col items-center">
                  {/* Bubble Icon */}
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-center text-4xl md:text-5xl mb-4 shadow-lg group-hover:border-indigo-500/50 group-hover:scale-105 transition-all duration-300 relative">
                    <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.icon}
                  </div>
                  
                  {/* Text Labels */}
                  <div className="font-bold text-lg text-slate-200 group-hover:text-indigo-400 transition-colors">{item.label}</div>
                  <div className="text-xs md:text-sm text-slate-500 mt-1.5 font-mono uppercase">{item.desc}</div>
                </div>
                
                <div className="text-sm text-indigo-400/90 font-bold mt-4 bg-indigo-500/10 px-3.5 py-1 rounded-full border border-indigo-500/20">
                  Step {item.step}
                </div>

                {/* Connectors */}
                {index < supplyChainFlow.length - 1 && (
                  <>
                    <div className="hidden md:block absolute top-10 md:top-12 left-[70%] w-[60%] h-0.5 bg-gradient-to-r from-indigo-500/20 to-slate-800/40 -z-0">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-slate-900 border border-slate-800 rounded-full p-0.5">
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="md:hidden flex justify-center my-4">
                      <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Feature Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            onMouseEnter={() => setHovered(item.path)}
            onMouseLeave={() => setHovered(null)}
            className={`
              group relative glass-card glass-card-hover rounded-3xl p-8 text-left overflow-hidden border-2
              ${item.gradient} ${item.hoverGlow}
            `}
          >
            <div className="flex items-start space-x-6 relative z-10">
              <div className="flex-shrink-0 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 group-hover:border-indigo-500/30 group-hover:scale-105 transition-all shadow-inner">
                {item.icon}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-bold text-slate-200 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-2 flex items-center text-indigo-400 font-bold text-base group-hover:translate-x-1.5 transition-transform duration-300">
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Background Glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Footer copyright */}
      <div className="text-center text-slate-500 text-sm py-6 border-t border-slate-900 max-w-md mx-auto">
        <p className="mb-1.5">
          System secured by <span className="font-bold text-indigo-400">Ethereum Blockchain</span> technology.
        </p>
        <p>Security • Transparency • Real-time Tracking</p>
      </div>
    </div>
  )
}

