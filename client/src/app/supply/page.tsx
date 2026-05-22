'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { parseTransactionError } from '@/lib/errorUtils'
import { showNotification } from '@/components/Notification'

interface Medicine {
  id: string
  name: string
  description: string
  RMSid: string
  MANid: string
  DISid: string
  RETid: string
  stage: string
}

export default function Supply() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [med, setMed] = useState<{ [key: number]: Medicine }>({})
  const [medStage, setMedStage] = useState<string[]>([])
  const [rmsId, setRmsId] = useState('')
  const [manId, setManId] = useState('')
  const [disId, setDisId] = useState('')
  const [retId, setRetId] = useState('')
  const [soldId, setSoldId] = useState('')

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  const loadBlockchainData = async () => {
    try {
      setLoader(true)
      const { contract, account } = await getContract()
      setSupplyChain(contract)
      setCurrentAccount(account)

      const medCtr = await contract.methods.medicineCtr().call()
      const medData: { [key: number]: Medicine } = {}
      const medStageData: string[] = []

      for (let i = 0; i < medCtr; i++) {
        medData[i] = await contract.methods.MedicineStock(i + 1).call()
        medStageData[i] = await contract.methods.showStage(i + 1).call()
      }

      setMed(medData)
      setMedStage(medStageData)
      setLoader(false)
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoader(false)
    }
  }

  const handlerChangeRMSId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRmsId(event.target.value)
  }

  const handlerChangeManId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManId(event.target.value)
  }

  const handlerChangeDisId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisId(event.target.value)
  }

  const handlerChangeRetId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRetId(event.target.value)
  }

  const handlerChangeSoldId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSoldId(event.target.value)
  }

  const handlerSubmitRMSsupply = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const receipt = await supplyChain.methods.RMSsupply(rmsId).send({ from: currentAccount })
      if (receipt) {
        loadBlockchainData()
        setRmsId('')
        showNotification('Material supplied successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmitManufacturing = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const receipt = await supplyChain.methods.Manufacturing(manId).send({ from: currentAccount })
      if (receipt) {
        loadBlockchainData()
        setManId('')
        showNotification('Manufacturing completed successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmitDistribute = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const receipt = await supplyChain.methods.Distribute(disId).send({ from: currentAccount })
      if (receipt) {
        loadBlockchainData()
        setDisId('')
        showNotification('Product distributed successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmitRetail = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const receipt = await supplyChain.methods.Retail(retId).send({ from: currentAccount })
      if (receipt) {
        loadBlockchainData()
        setRetId('')
        showNotification('Product retailed successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmitSold = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const receipt = await supplyChain.methods.sold(soldId).send({ from: currentAccount })
      if (receipt) {
        loadBlockchainData()
        setSoldId('')
        showNotification('Product marked as sold successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const getStageBadge = (stage: string) => {
    if (stage.includes('Ordered')) {
      return (
        <span className="px-3.5 py-1.5 rounded-full text-sm font-extrabold border border-blue-500/30 bg-blue-500/10 text-blue-400 glow-blue">
          Ordered
        </span>
      )
    }
    if (stage.includes('Raw Material')) {
      return (
        <span className="px-3.5 py-1.5 rounded-full text-sm font-extrabold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 glow-green">
          Raw Material Supplied (RMS)
        </span>
      )
    }
    if (stage.includes('Manufacturing')) {
      return (
        <span className="px-3.5 py-1.5 rounded-full text-sm font-extrabold border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 glow-yellow">
          Manufactured (MAN)
        </span>
      )
    }
    if (stage.includes('Distribution')) {
      return (
        <span className="px-3.5 py-1.5 rounded-full text-sm font-extrabold border border-purple-500/30 bg-purple-500/10 text-purple-400 glow-purple">
          Distributed (DIS)
        </span>
      )
    }
    if (stage.includes('Retail')) {
      return (
        <span className="px-3.5 py-1.5 rounded-full text-sm font-extrabold border border-orange-500/30 bg-orange-500/10 text-orange-400 glow-orange">
          Retailed (RET)
        </span>
      )
    }
    if (stage.includes('Sold')) {
      return (
        <span className="px-3.5 py-1.5 rounded-full text-sm font-extrabold border border-red-500/30 bg-red-500/10 text-red-400 glow-red">
          Sold
        </span>
      )
    }
    return (
      <span className="px-3.5 py-1.5 rounded-full text-sm font-extrabold border border-gray-500/30 bg-gray-500/10 text-gray-400">
        Unknown
      </span>
    )
  }

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-slate-400 font-bold text-lg animate-pulse">Loading Blockchain Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Supply Chain Operations
              </h1>
              <p className="text-gray-400 text-base mt-1">Confirm and update material stages through the workflow</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all duration-300 flex items-center font-bold text-base shadow-lg shadow-black/20 hover:scale-[1.01]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home Dashboard
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-sm font-mono text-gray-400">
          <span>Current Account:</span>
          <span className="text-cyan-400 select-all font-bold">{currentAccount}</span>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Shipment & Processing Flow (5-Step Process)
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-5 py-5 px-6 bg-white/[0.01] rounded-xl border border-white/[0.04]">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border border-blue-500/50 bg-blue-500/10 flex items-center justify-center text-blue-400 font-extrabold text-lg glow-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              1
            </div>
            <span className="text-sm mt-2 text-gray-300 font-bold text-center">Ordered</span>
          </div>
          <svg className="w-6 h-6 text-gray-600 animate-pulse hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-extrabold text-lg glow-green shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              2
            </div>
            <span className="text-sm mt-2 text-gray-300 font-bold text-center font-mono">RMS Supply</span>
          </div>
          <svg className="w-6 h-6 text-gray-600 animate-pulse hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border border-yellow-500/50 bg-yellow-500/10 flex items-center justify-center text-yellow-400 font-extrabold text-lg glow-yellow shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              3
            </div>
            <span className="text-sm mt-2 text-gray-300 font-bold text-center">Manufactured</span>
          </div>
          <svg className="w-6 h-6 text-gray-600 animate-pulse hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border border-purple-500/50 bg-purple-500/10 flex items-center justify-center text-purple-400 font-extrabold text-lg glow-purple shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              4
            </div>
            <span className="text-sm mt-2 text-gray-300 font-bold text-center">Distributed</span>
          </div>
          <svg className="w-6 h-6 text-gray-600 animate-pulse hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border border-orange-500/50 bg-orange-500/10 flex items-center justify-center text-orange-400 font-extrabold text-lg glow-orange shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              5
            </div>
            <span className="text-sm mt-2 text-gray-300 font-bold text-center">Retailed</span>
          </div>
          <svg className="w-6 h-6 text-gray-600 animate-pulse hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border border-red-500/50 bg-red-500/10 flex items-center justify-center text-red-400 font-extrabold text-lg glow-red shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              ✓
            </div>
            <span className="text-sm mt-2 text-gray-300 font-bold text-center">Sold</span>
          </div>
        </div>
      </div>

      {/* Materials list in stock */}
      <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Material List in the System
          </h2>
          <div className="text-sm text-gray-400 font-mono font-semibold">
            Total: <span className="text-cyan-400 font-extrabold">{Object.keys(med).length}</span> items
          </div>
        </div>

        {Object.keys(med).length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-400 text-lg font-semibold">No materials created yet.</p>
            <p className="text-gray-500 text-sm mt-2">Please go to the &quot;Order Materials&quot; page to initiate a new item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] text-base">
            <table className="min-w-full divide-y divide-white/[0.06]">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">Material Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">Current Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] bg-white/[0.005]">
                {Object.keys(med).map((key) => {
                  const index = parseInt(key)
                  const stage = medStage[index]
                  return (
                    <tr key={key} className="hover:bg-white/[0.02] transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center text-cyan-400 font-mono font-extrabold mr-3 shadow-inner">
                            {med[index].id}
                          </div>
                          <span className="font-bold text-gray-200">ID: {med[index].id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-200">{med[index].name}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm max-w-xs truncate">{med[index].description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStageBadge(stage)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action steps for Supply chain state transitions */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Step 2: RMS supply */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">STEP 2</span>
                <h3 className="text-xl font-extrabold text-white">RMS Supply (Raw Material Supply)</h3>
              </div>
              <p className="text-base text-gray-400 mt-1.5">Only accounts registered with the <span className="text-emerald-400 font-semibold">Raw Material Supplier (RMS)</span> role have permission to execute this.</p>
            </div>
          </div>

          <form onSubmit={handlerSubmitRMSsupply} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-mono text-base font-bold">ID</span>
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 rounded-xl focus:ring-1 focus:ring-emerald-500/30 text-white font-semibold text-base placeholder-gray-500 transition-all duration-300"
                type="text"
                onChange={handlerChangeRMSId}
                placeholder="Enter Material ID"
                value={rmsId}
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
            >
              Supply Materials (RMS)
            </button>
          </form>
        </div>

        {/* Step 3: Manufacturer */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all duration-300"></div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">STEP 3</span>
                <h3 className="text-xl font-extrabold text-white">Manufacture (Manufacturing & Assembly)</h3>
              </div>
              <p className="text-base text-gray-400 mt-1.5">Only accounts registered with the <span className="text-yellow-400 font-semibold">Manufacturer (MAN)</span> role have permission to execute this.</p>
            </div>
          </div>

          <form onSubmit={handlerSubmitManufacturing} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-mono text-base font-bold">ID</span>
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-yellow-500/50 rounded-xl focus:ring-1 focus:ring-yellow-500/30 text-white font-semibold text-base placeholder-gray-500 transition-all duration-300"
                type="text"
                onChange={handlerChangeManId}
                placeholder="Enter Material ID"
                value={manId}
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold text-lg rounded-xl shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transform hover:-translate-y-0.5 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
            >
              Complete Manufacturing (MAN)
            </button>
          </form>
        </div>

        {/* Step 4: Distributor */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-300"></div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">STEP 4</span>
                <h3 className="text-xl font-extrabold text-white">Distribute (Distribution & Shipping)</h3>
              </div>
              <p className="text-base text-gray-400 mt-1.5">Only accounts registered with the <span className="text-purple-400 font-semibold">Distributor (DIS)</span> role have permission to execute this.</p>
            </div>
          </div>

          <form onSubmit={handlerSubmitDistribute} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-mono text-base font-bold">ID</span>
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-purple-500/50 rounded-xl focus:ring-1 focus:ring-purple-500/30 text-white font-semibold text-base placeholder-gray-500 transition-all duration-300"
                type="text"
                onChange={handlerChangeDisId}
                placeholder="Enter Material ID"
                value={disId}
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transform hover:-translate-y-0.5 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
            >
              Ship Materials (DIS)
            </button>
          </form>
        </div>

        {/* Step 5: Retailer */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-300"></div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded">STEP 5</span>
                <h3 className="text-xl font-extrabold text-white">Retail (Receive in Store)</h3>
              </div>
              <p className="text-base text-gray-400 mt-1.5">Only accounts registered with the <span className="text-orange-400 font-semibold">Retailer (RET)</span> role have permission to execute this.</p>
            </div>
          </div>

          <form onSubmit={handlerSubmitRetail} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-mono text-base font-bold">ID</span>
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-xl focus:ring-1 focus:ring-orange-500/30 text-white font-semibold text-base placeholder-gray-500 transition-all duration-300"
                type="text"
                onChange={handlerChangeRetId}
                placeholder="Enter Material ID"
                value={retId}
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transform hover:-translate-y-0.5 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
            >
              Receive in Store (RET)
            </button>
          </form>
        </div>

        {/* Final step: Sold */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all duration-300"></div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">FINAL STEP</span>
                <h3 className="text-xl font-extrabold text-white">Mark as Sold (Sold to Consumer)</h3>
              </div>
              <p className="text-base text-gray-400 mt-1.5">Mark the product stage as officially purchased and owned by the end consumer.</p>
            </div>
          </div>

          <form onSubmit={handlerSubmitSold} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-mono text-base font-bold">ID</span>
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-red-500/50 rounded-xl focus:ring-1 focus:ring-red-500/30 text-white font-semibold text-base placeholder-gray-500 transition-all duration-300"
                type="text"
                onChange={handlerChangeSoldId}
                placeholder="Enter Material ID"
                value={soldId}
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transform hover:-translate-y-0.5 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
            >
              Mark as Sold
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
