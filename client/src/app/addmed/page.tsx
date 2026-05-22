'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { checkIsOwner, getContractOwner } from '@/lib/contractUtils'
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

export default function AddMed() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [med, setMed] = useState<{ [key: number]: Medicine }>({})
  const [medName, setMedName] = useState('')
  const [medDes, setMedDes] = useState('')
  const [medStage, setMedStage] = useState<string[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [contractOwner, setContractOwner] = useState<string>('')
  const [roleCounts, setRoleCounts] = useState({
    rms: 0,
    man: 0,
    dis: 0,
    ret: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      
      const rmsCount = await contract.methods.rmsCtr().call()
      const manCount = await contract.methods.manCtr().call()
      const disCount = await contract.methods.disCtr().call()
      const retCount = await contract.methods.retCtr().call()
      
      setRoleCounts({
        rms: parseInt(rmsCount),
        man: parseInt(manCount),
        dis: parseInt(disCount),
        ret: parseInt(retCount),
      })
      
      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
      const owner = await getContractOwner()
      if (owner) setContractOwner(owner)
      
      setLoader(false)
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoader(false)
    }
  }

  const handlerChangeNameMED = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMedName(event.target.value)
  }

  const handlerChangeDesMED = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMedDes(event.target.value)
  }

  const handlerSubmitMED = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const receipt = await supplyChain.methods.addMedicine(medName, medDes).send({ from: currentAccount })
      if (receipt) {
        loadBlockchainData()
        setMedName('')
        setMedDes('')
        showNotification('Material order created successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStageColor = (stage: string) => {
    if (stage.includes('Ordered')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    if (stage.includes('Raw Material')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (stage.includes('Manufacturing')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    if (stage.includes('Distribution')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    if (stage.includes('Retail')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    if (stage.includes('Sold')) return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-slate-400 font-extrabold text-xl animate-pulse">Loading Blockchain Data...</p>
        </div>
      </div>
    )
  }

  const hasMissingRoles = roleCounts.rms === 0 || roleCounts.man === 0 || roleCounts.dis === 0 || roleCounts.ret === 0

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100">Order Materials</h1>
            <p className="text-slate-400 text-base md:text-lg mt-1">Initiate and order new raw material shipments on the Blockchain</p>
          </div>
        </div>
      </div>

      {/* Access Restriction Warning */}
      {!isOwner && (
        <div className="glass-card border-red-500/30 glow-red rounded-2xl p-6 bg-red-500/5">
          <div className="flex items-start space-x-4">
            <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-2">
              <h3 className="text-red-400 font-extrabold text-xl">Order Creation Restricted</h3>
              <p className="text-slate-300 text-base md:text-lg">
                Only the contract owner account (Owner) has the authority to create new raw material orders in this system.
              </p>
              <div className="mt-4 pt-3 border-t border-red-500/10 space-y-1.5 text-base font-mono">
                <p className="text-slate-400">Contract Owner: <span className="text-red-400/90 break-all select-all font-bold">{contractOwner}</span></p>
                <p className="text-slate-400">Your Connected Address: <span className="text-slate-300 break-all select-all font-bold">{currentAccount}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Roles Missing Warning */}
      {isOwner && hasMissingRoles && (
        <div className="glass-card border-amber-500/30 glow-yellow rounded-2xl p-6 bg-amber-500/5">
          <div className="flex items-start space-x-4 mb-6">
            <svg className="w-8 h-8 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-amber-400 font-extrabold text-xl">Requirements Not Met</h3>
              <p className="text-slate-300 text-base md:text-lg">
                You must register at least one partner for each role below before proceeding with raw material orders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border ${roleCounts.rms > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Supplier (RMS)</div>
              <div className="text-xl font-extrabold mt-1.5">{roleCounts.rms} Registered</div>
            </div>
            <div className={`p-4 rounded-xl border ${roleCounts.man > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Manufacturer (MAN)</div>
              <div className="text-xl font-extrabold mt-1.5">{roleCounts.man} Registered</div>
            </div>
            <div className={`p-4 rounded-xl border ${roleCounts.dis > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Distributor (DIS)</div>
              <div className="text-xl font-extrabold mt-1.5">{roleCounts.dis} Registered</div>
            </div>
            <div className={`p-4 rounded-xl border ${roleCounts.ret > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Retailer (RET)</div>
              <div className="text-xl font-extrabold mt-1.5">{roleCounts.ret} Registered</div>
            </div>
          </div>

          <button
            onClick={() => router.push('/roles')}
            className="mt-6 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-extrabold transition-all flex items-center shadow-lg shadow-indigo-500/20 border border-indigo-500/30 cursor-pointer"
          >
            Go to Register Roles
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Material order creation form */}
      <div className="glass-card rounded-2xl p-8 md:p-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-200">Order Raw Materials</h2>
        </div>
        
        <form onSubmit={handlerSubmitMED} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              className="w-full glass-input rounded-xl px-4 py-4 text-base md:text-lg font-semibold"
              type="text"
              onChange={handlerChangeNameMED}
              placeholder="Raw Material Name (e.g. Lithium-Ion Battery)"
              value={medName}
              required
              disabled={isSubmitting}
            />
            <input
              className="w-full glass-input rounded-xl px-4 py-4 text-base md:text-lg font-semibold"
              type="text"
              onChange={handlerChangeDesMED}
              placeholder="Detailed Description (e.g. 5000mAh Capacity)"
              value={medDes}
              required
              disabled={isSubmitting}
            />
          </div>
          
          {/* Submit button (Standard thick padding: py-5) */}
          <button
            type="submit"
            disabled={!isOwner || hasMissingRoles || isSubmitting}
            className={`w-full py-5 rounded-xl font-extrabold tracking-wide transition-all shadow-lg flex items-center justify-center text-lg md:text-xl border ${
              isOwner && !hasMissingRoles && !isSubmitting
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.01] hover:shadow-emerald-500/20 cursor-pointer border-emerald-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700/50'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting transaction to Blockchain...
              </>
            ) : !isOwner ? (
              <>
                <svg className="w-6 h-6 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Only Contract Owner is authorized
              </>
            ) : hasMissingRoles ? (
              <>
                <svg className="w-6 h-6 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                All partner roles must be registered first
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Material Order
              </>
            )}
          </button>
        </form>
      </div>

      {/* Placed material orders list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="font-extrabold text-slate-200 text-lg md:text-xl animate-none">Placed Material Orders</h2>
          </div>
          <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full text-sm font-extrabold">
            Total: {Object.keys(med).length} items
          </span>
        </div>
        
        {Object.keys(med).length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-3 bg-slate-950/10">
            <svg className="w-14 h-14 mx-auto text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-base font-semibold">No material orders registered in the system yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-base">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-extrabold">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Material Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Current Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.keys(med).map((key) => {
                  const index = parseInt(key)
                  const stage = medStage[index]
                  return (
                    <tr key={key} className="hover:bg-slate-900/35 transition-colors">
                      <td className="px-6 py-4 font-mono font-extrabold text-slate-300">
                        #{med[index].id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-200">
                        {med[index].name}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {med[index].description}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3.5 py-1 rounded-full text-sm font-extrabold border ${getStageColor(stage)}`}>
                          {stage}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
