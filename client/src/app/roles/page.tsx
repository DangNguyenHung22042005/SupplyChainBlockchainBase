'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { checkIsOwner, getContractOwner } from '@/lib/contractUtils'
import { parseTransactionError } from '@/lib/errorUtils'
import { showNotification } from '@/components/Notification'

interface Role {
  addr: string
  id: string
  name: string
  place: string
}

export default function AssignRoles() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [contractOwner, setContractOwner] = useState<string>('')
  const [roles, setRoles] = useState<{
    rms: Role[]
    man: Role[]
    dis: Role[]
    ret: Role[]
  }>({
    rms: [],
    man: [],
    dis: [],
    ret: [],
  })

  const [newRole, setNewRole] = useState({
    address: '',
    name: '',
    place: '',
    type: 'rms',
  })

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  const loadBlockchainData = async () => {
    try {
      setLoading(true)
      const { contract, account } = await getContract()
      setSupplyChain(contract)
      setCurrentAccount(account)

      const rmsCount = await contract.methods.rmsCtr().call()
      const manCount = await contract.methods.manCtr().call()
      const disCount = await contract.methods.disCtr().call()
      const retCount = await contract.methods.retCtr().call()

      const rms = await Promise.all(
        Array(parseInt(rmsCount))
          .fill(null)
          .map((_, i) => contract.methods.RMS(i + 1).call())
      )
      const man = await Promise.all(
        Array(parseInt(manCount))
          .fill(null)
          .map((_, i) => contract.methods.MAN(i + 1).call())
      )
      const dis = await Promise.all(
        Array(parseInt(disCount))
          .fill(null)
          .map((_, i) => contract.methods.DIS(i + 1).call())
      )
      const ret = await Promise.all(
        Array(parseInt(retCount))
          .fill(null)
          .map((_, i) => contract.methods.RET(i + 1).call())
      )

      setRoles({ rms, man, dis, ret })
      
      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
      const owner = await getContractOwner()
      if (owner) setContractOwner(owner)
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoading(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setNewRole((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleRoleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const { address, name, place, type } = newRole
    try {
      let receipt
      switch (type) {
        case 'rms':
          receipt = await supplyChain.methods.addRMS(address, name, place).send({ from: currentAccount })
          break
        case 'man':
          receipt = await supplyChain.methods.addManufacturer(address, name, place).send({ from: currentAccount })
          break
        case 'dis':
          receipt = await supplyChain.methods.addDistributor(address, name, place).send({ from: currentAccount })
          break
        case 'ret':
          receipt = await supplyChain.methods.addRetailer(address, name, place).send({ from: currentAccount })
          break
        default:
          showNotification('Invalid role type selected', 'error')
          return
      }
      if (receipt) {
        showNotification('Role registered successfully!', 'success')
        loadBlockchainData()
        setNewRole({ address: '', name: '', place: '', type: 'rms' })
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-slate-400 font-extrabold text-xl animate-pulse">Loading Blockchain Data...</p>
        </div>
      </div>
    )
  }

  const roleConfig = {
    rms: {
      label: 'Raw Material Supplier (RMS)',
      plural: 'Raw Material Suppliers List (RMS)',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      glow: 'glow-indigo border-indigo-500/20 bg-indigo-500/5',
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
      textGlow: 'text-indigo-400',
    },
    man: {
      label: 'Manufacturer (MAN)',
      plural: 'Manufacturers List (MAN)',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      glow: 'glow-green border-emerald-500/20 bg-emerald-500/5',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      textGlow: 'text-emerald-400',
    },
    dis: {
      label: 'Distributor (DIS)',
      plural: 'Distributors List (DIS)',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      glow: 'glow-purple border-purple-500/20 bg-purple-500/5',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      textGlow: 'text-purple-400',
    },
    ret: {
      label: 'Retailer (RET)',
      plural: 'Retailers List (RET)',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      glow: 'glow-orange border-orange-500/20 bg-orange-500/5',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
      textGlow: 'text-orange-400',
    },
  }

  const activeRoleConfig = roleConfig[newRole.type as keyof typeof roleConfig]

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100">Register Roles</h1>
            <p className="text-slate-400 text-base md:text-lg mt-1">Assign blockchain credentials to participating supply chain partners</p>
          </div>
        </div>
      </div>

      {/* Owner Access Required Notification */}
      {!isOwner && (
        <div className="glass-card border-red-500/30 glow-red rounded-2xl p-6 bg-red-500/5">
          <div className="flex items-start space-x-4">
            <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-2">
              <h3 className="text-red-400 font-extrabold text-xl">Contract Owner Role Required</h3>
              <p className="text-slate-300 text-base md:text-lg">
                Only the contract owner account (Owner) has the authorization to register and grant credentials to new partners.
              </p>
              <div className="mt-4 pt-3 border-t border-red-500/10 space-y-1.5 text-base font-mono">
                <p className="text-slate-400">Contract Owner: <span className="text-red-400/90 break-all select-all font-bold">{contractOwner || 'Loading...'}</span></p>
                <p className="text-slate-400">Your Connected Address: <span className="text-slate-300 break-all select-all font-bold">{currentAccount}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner registration form */}
      <div className={`glass-card rounded-2xl p-8 md:p-10 border-l-4 transition-all duration-300 ${activeRoleConfig.glow}`}>
        <div className="flex items-center space-x-4 mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-slate-100 bg-slate-900 border border-slate-800 ${activeRoleConfig.textGlow}`}>
            {activeRoleConfig.icon}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-200">Register New Partner</h2>
            <p className="text-slate-400 text-base">Provide details to register the wallet address with a role on the Blockchain</p>
          </div>
        </div>

        <form onSubmit={handleRoleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role selection */}
            <div>
              <label className="block text-sm md:text-base font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                Role Type
              </label>
              <div className="relative">
                <select
                  name="type"
                  onChange={handleInputChange}
                  value={newRole.type}
                  className="w-full glass-input rounded-xl px-4 py-4 text-slate-200 text-base md:text-lg font-semibold appearance-none cursor-pointer focus:ring-indigo-500/40"
                  required
                >
                  <option className="bg-slate-950 text-slate-200" value="rms">Raw Material Supplier (RMS)</option>
                  <option className="bg-slate-950 text-slate-200" value="man">Manufacturer (MAN)</option>
                  <option className="bg-slate-950 text-slate-200" value="dis">Distributor (DIS)</option>
                  <option className="bg-slate-950 text-slate-200" value="ret">Retailer (RET)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Ethereum wallet address */}
            <div>
              <label className="block text-sm md:text-base font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                Ethereum Wallet Address (0x...)
              </label>
              <input
                type="text"
                name="address"
                placeholder="0x..."
                onChange={handleInputChange}
                value={newRole.address}
                className="w-full glass-input rounded-xl px-4 py-4 text-base md:text-lg font-mono text-slate-200"
                required
              />
            </div>

            {/* Partner name */}
            <div>
              <label className="block text-sm md:text-base font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                Partner / Business Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Supplier Alpha, Manufacturer Beta..."
                onChange={handleInputChange}
                value={newRole.name}
                className="w-full glass-input rounded-xl px-4 py-4 text-base md:text-lg text-slate-200 font-semibold"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm md:text-base font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                Location
              </label>
              <input
                type="text"
                name="place"
                placeholder="e.g. Hanoi, Vietnam"
                onChange={handleInputChange}
                value={newRole.place}
                className="w-full glass-input rounded-xl px-4 py-4 text-base md:text-lg text-slate-200 font-semibold"
                required
              />
            </div>
          </div>

          {/* Action button (Thick padding: py-5, standard and thick) */}
          <button
            type="submit"
            disabled={!isOwner}
            className={`w-full py-5 rounded-xl font-extrabold tracking-wide transition-all shadow-lg flex items-center justify-center text-lg md:text-xl border ${
              isOwner
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-[1.01] hover:shadow-indigo-500/20 cursor-pointer border-indigo-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700/50'
            }`}
          >
            {isOwner ? (
              <>
                <svg className="w-6 h-6 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirm Registration of {activeRoleConfig.label}
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Action Restricted to Contract Owner Only
              </>
            )}
          </button>
        </form>
      </div>

      {/* List of registered partners */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-200 tracking-wide uppercase">Registered Partners</h2>

        {(['rms', 'man', 'dis', 'ret'] as const).map((roleType) => {
          const config = roleConfig[roleType]
          const roleList = roles[roleType]
          const totalCount = roleList.length

          return (
            <div key={roleType} className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 ${config.textGlow}`}>
                    {config.icon}
                  </div>
                  <h3 className="font-extrabold text-slate-200 text-lg md:text-xl">{config.plural}</h3>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-extrabold border ${config.badge}`}>
                  Registered: {totalCount}
                </span>
              </div>

              {totalCount === 0 ? (
                <div className="text-center py-12 bg-slate-950/20 text-slate-500 space-y-3">
                  <svg className="w-14 h-14 mx-auto text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-lg font-semibold">No {config.label} units registered yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-base">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-extrabold">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Entity Name</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Blockchain Wallet Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {roleList.map((role, index) => (
                        <tr key={index} className="hover:bg-slate-900/35 transition-colors">
                          <td className="px-6 py-4 font-mono font-extrabold text-slate-300">
                            #{role.id}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-200">
                            {role.name}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{role.place}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-slate-400 bg-slate-950 border border-slate-800/80 px-3 py-1.5 rounded-lg break-all select-all font-semibold">
                              {role.addr}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
