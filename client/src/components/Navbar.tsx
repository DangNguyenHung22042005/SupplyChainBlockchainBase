'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Web3 from 'web3'
import deployments from '../deployments.json'

export default function Navbar() {
  const pathname = usePathname()
  const [account, setAccount] = useState<string>('')
  const [network, setNetwork] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Overview', href: '/' },
    { name: 'Register Roles', href: '/roles' },
    { name: 'Order Materials', href: '/addmed' },
    { name: 'Control Chain', href: '/supply' },
    { name: 'Track Item', href: '/track' },
  ]

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum)
          const accounts = await web3.eth.getAccounts()
          if (accounts.length > 0) {
            setAccount(accounts[0])
          }

          const chainId = await web3.eth.getChainId()
          const chainIdStr = chainId.toString()
          if (deployments.networks[chainIdStr as keyof typeof deployments.networks]) {
            setNetwork('Ganache 1337')
          } else {
            setNetwork(`Chain ID: ${chainIdStr}`)
          }
        } catch (err) {
          console.error('Error loading web3 inside Navbar:', err)
        }
      }
    }

    initWeb3()

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          setAccount('')
        }
      }
      
      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [])

  const shortenAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="hidden bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:block">
                VeloChain
              </span>
            </Link>

            {/* Navigation links (Tăng font size to rõ hơn) */}
            <div className="hidden md:ml-12 md:flex md:items-center md:space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`rounded-xl px-4 py-2.5 text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Web3 connection info */}
          <div className="hidden md:flex md:items-center md:space-x-5">
            {network && (
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3.5 py-1 text-sm font-bold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                {network}
              </span>
            )}
            
            <div className="flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${account ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${account ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className="font-mono text-sm font-bold text-slate-300">
                {account ? shortenAddress(account) : 'Wallet Not Connected'}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B0F19] px-2 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-3 py-2 text-lg font-medium ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="border-t border-slate-800 pt-4 pb-2 px-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${account ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span className={`relative inline-flex h-2 w-2 rounded-full ${account ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className="font-mono text-sm text-slate-300">
                {account ? shortenAddress(account) : 'Wallet Not Connected'}
              </span>
            </div>
            {network && (
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                {network}
              </span>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
