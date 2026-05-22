'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { QRCodeCanvas } from 'qrcode.react'
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

interface Role {
  addr: string
  id: string
  name: string
  place: string
}

export default function Track() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [med, setMed] = useState<{ [key: number]: Medicine }>({})
  const [medStage, setMedStage] = useState<{ [key: number]: string }>({})
  const [id, setId] = useState('')
  const [trackedId, setTrackedId] = useState<number | null>(null)
  const [timestamps, setTimestamps] = useState<{ [key: number]: string }>({})
  const [rms, setRMS] = useState<{ [key: number]: Role }>({})
  const [man, setMAN] = useState<{ [key: number]: Role }>({})
  const [dis, setDIS] = useState<{ [key: number]: Role }>({})
  const [ret, setRET] = useState<{ [key: number]: Role }>({})
  const [trackTillSold, setTrackTillSold] = useState(false)
  const [trackTillRetail, setTrackTillRetail] = useState(false)
  const [trackTillDistribution, setTrackTillDistribution] = useState(false)
  const [trackTillManufacture, setTrackTillManufacture] = useState(false)
  const [trackTillRMS, setTrackTillRMS] = useState(false)
  const [trackTillOrdered, setTrackTillOrdered] = useState(false)

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
      const medStageData: { [key: number]: string } = {}

      for (let i = 0; i < medCtr; i++) {
        medData[i + 1] = await contract.methods.MedicineStock(i + 1).call()
        medStageData[i + 1] = await contract.methods.showStage(i + 1).call()
      }

      setMed(medData)
      setMedStage(medStageData)

      const rmsCtr = await contract.methods.rmsCtr().call()
      const rmsData: { [key: number]: Role } = {}
      for (let i = 0; i < rmsCtr; i++) {
        rmsData[i + 1] = await contract.methods.RMS(i + 1).call()
      }
      setRMS(rmsData)

      const manCtr = await contract.methods.manCtr().call()
      const manData: { [key: number]: Role } = {}
      for (let i = 0; i < manCtr; i++) {
        manData[i + 1] = await contract.methods.MAN(i + 1).call()
      }
      setMAN(manData)

      const disCtr = await contract.methods.disCtr().call()
      const disData: { [key: number]: Role } = {}
      for (let i = 0; i < disCtr; i++) {
        disData[i + 1] = await contract.methods.DIS(i + 1).call()
      }
      setDIS(disData)

      const retCtr = await contract.methods.retCtr().call()
      const retData: { [key: number]: Role } = {}
      for (let i = 0; i < retCtr; i++) {
        retData[i + 1] = await contract.methods.RET(i + 1).call()
      }
      setRET(retData)

      setLoader(false)

      // Auto-track if ID is in URL query parameter
      const params = new URLSearchParams(window.location.search)
      const urlId = params.get('id')
      if (urlId) {
        const medicineId = parseInt(urlId)
        if (!isNaN(medicineId) && medicineId > 0 && medicineId <= parseInt(medCtr)) {
          setId(urlId)
          await trackMedicine(medicineId, medData, contract)
        }
      }
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoader(false)
    }
  }

  const handlerChangeID = (event: React.ChangeEvent<HTMLInputElement>) => {
    setId(event.target.value)
  }

  const trackMedicine = async (medicineId: number, medStockOverride?: { [key: number]: Medicine }, contractOverride?: any) => {
    try {
      const activeContract = contractOverride || supplyChain
      const ctr = await activeContract.methods.medicineCtr().call()
      if (!(medicineId > 0 && medicineId <= parseInt(ctr))) {
        showNotification('Material ID does not exist!', 'error')
        return
      }
      
      const currentMedStock = medStockOverride || med
      if (!currentMedStock[medicineId]) {
        showNotification('Data is loading, please wait a moment.', 'warning')
        return
      }

      const stage = parseInt(currentMedStock[medicineId].stage)
      
      // Fetch timestamps for verified stages from blockchain contract
      const fetchedTimestamps: { [key: number]: string } = {}
      for (let i = 0; i <= stage; i++) {
        try {
          const ts = await activeContract.methods.stageTimestamps(medicineId, i).call()
          let tsNum = 0
          if (ts !== undefined && ts !== null) {
            tsNum = Number(ts.toString())
          }
          if (!isNaN(tsNum) && tsNum > 0) {
            const date = new Date(tsNum * 1000)
            // Formatted as standard Vietnamese date-time (e.g. 14:30:15 22/05/2026)
            fetchedTimestamps[i] = date.toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })
          } else {
            fetchedTimestamps[i] = 'N/A'
          }
        } catch (e) {
          console.error(`Error querying timestamp for stage ${i}:`, e)
          fetchedTimestamps[i] = 'N/A'
        }
      }
      setTimestamps(fetchedTimestamps)
      setTrackedId(medicineId)
      
      // Reset stages
      setTrackTillSold(false)
      setTrackTillRetail(false)
      setTrackTillDistribution(false)
      setTrackTillManufacture(false)
      setTrackTillRMS(false)
      setTrackTillOrdered(false)

      if (stage === 5) setTrackTillSold(true)
      else if (stage === 4) setTrackTillRetail(true)
      else if (stage === 3) setTrackTillDistribution(true)
      else if (stage === 2) setTrackTillManufacture(true)
      else if (stage === 1) setTrackTillRMS(true)
      else setTrackTillOrdered(true)
    } catch (err: any) {
      console.error('Error tracking medicine:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const medicineId = parseInt(id)
    if (isNaN(medicineId)) {
      showNotification('Please enter a valid ID number!', 'error')
      return
    }
    await trackMedicine(medicineId)
  }

  const resetTracking = () => {
    setTrackTillSold(false)
    setTrackTillRetail(false)
    setTrackTillDistribution(false)
    setTrackTillManufacture(false)
    setTrackTillRMS(false)
    setTrackTillOrdered(false)
    setTrackedId(null)
    setTimestamps({})
    setId('')
  }

  const stageIcons = {
    rms: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    manufacture: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    distribute: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    retail: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    sold: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  const TrackComponent = ({
    title,
    stages,
  }: {
    title: string
    stages: Array<{ label: string; data?: Role; showArrow?: boolean; icon?: JSX.Element; stageIndex: number }>
  }) => {
    if (trackedId === null) return null
    const medicineId = trackedId
    const currentStageNum = parseInt(med[medicineId]?.stage)

    // Build a highly compact, clean plain text report with dates and times included.
    // We omit long 42-character Ethereum addresses to reduce QR code density.
    let qrText = `PROVENANCE REPORT\n` +
      `ID: #${med[medicineId]?.id}\n` +
      `Product: ${med[medicineId]?.name}\n` +
      `Ordered: ${timestamps[0] || 'N/A'}\n` +
      `Status: ${medStage[medicineId]}\n\n` +
      `VERIFIED LOGS:\n`;

    if (currentStageNum >= 1) {
      const rmsPartner = rms[parseInt(med[medicineId]?.RMSid)]
      if (rmsPartner) {
        qrText += `• RMS: ${rmsPartner.name} (${rmsPartner.place}) - ${timestamps[1] || 'N/A'}\n`
      }
    }
    if (currentStageNum >= 2) {
      const manPartner = man[parseInt(med[medicineId]?.MANid)]
      if (manPartner) {
        qrText += `• MAN: ${manPartner.name} (${manPartner.place}) - ${timestamps[2] || 'N/A'}\n`
      }
    }
    if (currentStageNum >= 3) {
      const disPartner = dis[parseInt(med[medicineId]?.DISid)]
      if (disPartner) {
        qrText += `• DIS: ${disPartner.name} (${disPartner.place}) - ${timestamps[3] || 'N/A'}\n`
      }
    }
    if (currentStageNum >= 4) {
      const retPartner = ret[parseInt(med[medicineId]?.RETid)]
      if (retPartner) {
        qrText += `• RET: ${retPartner.name} (${retPartner.place}) - ${timestamps[4] || 'N/A'}\n`
      }
    }
    if (currentStageNum >= 5) {
      qrText += `• SOLD: ${timestamps[5] || 'N/A'}\n`
    }

    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Material Information Card */}
        <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 shadow-2xl rounded-2xl p-8 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-5 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold">Detailed Material Information</h3>
              <p className="text-purple-300 text-sm md:text-base mt-1 font-bold">Tracking ID: #{med[medicineId]?.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1.5">Material Name</div>
              <div className="text-xl font-extrabold text-white">{med[medicineId]?.name}</div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1.5">Product Description</div>
              <div className="text-xl font-extrabold text-white truncate">{med[medicineId]?.description}</div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1.5">Ordered Date/Time</div>
              <div className="text-xl font-extrabold text-white">{timestamps[0] || 'N/A'}</div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1.5">Current Stage Status</div>
              <div className="text-xl font-extrabold text-purple-300 font-mono">{medStage[medicineId]}</div>
            </div>
          </div>
        </div>

        {/* Supply Chain Journey Timeline */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-8">
          <h4 className="text-2xl font-extrabold text-white mb-8 flex items-center">
            <svg className="w-7 h-7 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Supply Chain Journey
          </h4>
          
          <div className="relative pl-8 md:pl-12 space-y-10">
            {/* Vertical glowing path line */}
            <div className="absolute left-[39px] md:left-[47px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-purple-500/20"></div>
            
            {stages.map((stage, index) => (
              <div key={index} className="relative flex flex-col md:flex-row md:items-start gap-6">
                {/* Node icon bubble */}
                <div className="absolute -left-[54px] md:-left-[62px] flex items-center justify-center">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 ${
                    stage.data 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 glow-purple shadow-purple-500/20' 
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}>
                    {stage.icon ? (
                      stage.icon
                    ) : (
                      <span className="font-bold text-base text-white">{index + 1}</span>
                    )}
                  </div>
                </div>
                
                {/* Stage information panel */}
                <div className={`flex-1 rounded-xl p-6 border transition-all duration-300 ${
                  stage.data 
                    ? 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]' 
                    : 'bg-white/[0.005] border-white/[0.03] opacity-60'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h5 className="text-lg font-extrabold text-gray-200">{stage.label}</h5>
                    {stage.data ? (
                      <span className="px-3 py-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-extrabold rounded-full glow-green">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 border border-yellow-500/25 bg-yellow-500/5 text-yellow-400/80 text-xs font-extrabold rounded-full">
                        ⏳ Pending / Not Processed
                      </span>
                    )}
                  </div>

                  {stage.data ? (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-base mt-3">
                      <div className="bg-white/[0.01] border border-white/[0.04] rounded-lg p-4">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Partner ID</div>
                        <div className="font-extrabold text-white text-lg">#{stage.data.id}</div>
                      </div>
                      <div className="bg-white/[0.01] border border-white/[0.04] rounded-lg p-4">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Partner Name</div>
                        <div className="font-extrabold text-white text-lg">{stage.data.name}</div>
                      </div>
                      <div className="bg-white/[0.01] border border-white/[0.04] rounded-lg p-4">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Location</div>
                        <div className="font-extrabold text-white text-lg flex items-center gap-1.5">
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {stage.data.place}
                        </div>
                      </div>
                      <div className="bg-white/[0.01] border border-white/[0.04] rounded-lg p-4">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Verification Time</div>
                        <div className="font-extrabold text-emerald-400 text-lg">
                          {timestamps[stage.stageIndex] || 'N/A'}
                        </div>
                      </div>
                      <div className="sm:col-span-4 bg-white/[0.01] border border-white/[0.04] rounded-lg p-4">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Blockchain Wallet Address</div>
                        <div className="font-mono text-sm text-cyan-400 font-bold break-all select-all">{stage.data.addr}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-base font-semibold italic">This stage has not been executed on the smart contract yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code section */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-8">
          <h4 className="text-2xl font-extrabold text-white mb-6 flex items-center">
            <svg className="w-7 h-7 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Product Identification QR Code
          </h4>
          <div className="flex flex-col items-center py-6">
            <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-purple-500/20">
              <QRCodeCanvas 
                value={qrText} 
                size={260}
                level="L"
                includeMargin={true}
              />
              <p className="text-center text-xs text-gray-600 mt-4 font-bold">
                Scan code to quickly query product details
              </p>
            </div>
            <div className="mt-4 text-center max-w-md bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-gray-400">
              <span className="font-extrabold text-purple-400">Provenance logs with timestamps:</span> {"Scanning this QR code will print a complete, verified chronology of the product's journey with precise dates and times."}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-5">
          <button
            onClick={resetTracking}
            className="flex-1 py-5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 text-lg border border-purple-500/30 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Track Another Material
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 text-lg cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (trackTillSold) {
    return (
      <div className="py-5">
        <TrackComponent
          title="Sold"
          stages={[
            {
              label: '1. Raw Material Supplier (RMS)',
              data: trackedId !== null ? rms[parseInt(med[trackedId]?.RMSid)] : undefined,
              showArrow: true,
              icon: stageIcons.rms,
              stageIndex: 1
            },
            {
              label: '2. Manufacturer & Assembly (MAN)',
              data: trackedId !== null ? man[parseInt(med[trackedId]?.MANid)] : undefined,
              showArrow: true,
              icon: stageIcons.manufacture,
              stageIndex: 2
            },
            {
              label: '3. Distributor & Logistics (DIS)',
              data: trackedId !== null ? dis[parseInt(med[trackedId]?.DISid)] : undefined,
              showArrow: true,
              icon: stageIcons.distribute,
              stageIndex: 3
            },
            {
              label: '4. Retailer & Outlet (RET)',
              data: trackedId !== null ? ret[parseInt(med[trackedId]?.RETid)] : undefined,
              showArrow: true,
              icon: stageIcons.retail,
              stageIndex: 4
            },
            { 
              label: '5. Sold to Consumer', 
              showArrow: false,
              icon: stageIcons.sold,
              data: { id: "Final Transaction", name: "End Consumer", place: "In-Store Purchase", addr: "Payment completed via blockchain wallet" },
              stageIndex: 5
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillRetail) {
    return (
      <div className="py-5">
        <TrackComponent
          title="Retail"
          stages={[
            {
              label: '1. Raw Material Supplier (RMS)',
              data: trackedId !== null ? rms[parseInt(med[trackedId]?.RMSid)] : undefined,
              showArrow: true,
              icon: stageIcons.rms,
              stageIndex: 1
            },
            {
              label: '2. Manufacturer & Assembly (MAN)',
              data: trackedId !== null ? man[parseInt(med[trackedId]?.MANid)] : undefined,
              showArrow: true,
              icon: stageIcons.manufacture,
              stageIndex: 2
            },
            {
              label: '3. Distributor & Logistics (DIS)',
              data: trackedId !== null ? dis[parseInt(med[trackedId]?.DISid)] : undefined,
              showArrow: true,
              icon: stageIcons.distribute,
              stageIndex: 3
            },
            {
              label: '4. Retailer & Outlet (RET)',
              data: trackedId !== null ? ret[parseInt(med[trackedId]?.RETid)] : undefined,
              showArrow: false,
              icon: stageIcons.retail,
              stageIndex: 4
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillDistribution) {
    return (
      <div className="py-5">
        <TrackComponent
          title="Distribution"
          stages={[
            {
              label: '1. Raw Material Supplier (RMS)',
              data: trackedId !== null ? rms[parseInt(med[trackedId]?.RMSid)] : undefined,
              showArrow: true,
              icon: stageIcons.rms,
              stageIndex: 1
            },
            {
              label: '2. Manufacturer & Assembly (MAN)',
              data: trackedId !== null ? man[parseInt(med[trackedId]?.MANid)] : undefined,
              showArrow: true,
              icon: stageIcons.manufacture,
              stageIndex: 2
            },
            {
              label: '3. Distributor & Logistics (DIS)',
              data: trackedId !== null ? dis[parseInt(med[trackedId]?.DISid)] : undefined,
              showArrow: false,
              icon: stageIcons.distribute,
              stageIndex: 3
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillManufacture) {
    return (
      <div className="py-5">
        <TrackComponent
          title="Manufacture"
          stages={[
            {
              label: '1. Raw Material Supplier (RMS)',
              data: trackedId !== null ? rms[parseInt(med[trackedId]?.RMSid)] : undefined,
              showArrow: true,
              icon: stageIcons.rms,
              stageIndex: 1
            },
            {
              label: '2. Manufacturer & Assembly (MAN)',
              data: trackedId !== null ? man[parseInt(med[trackedId]?.MANid)] : undefined,
              showArrow: false,
              icon: stageIcons.manufacture,
              stageIndex: 2
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillRMS) {
    return (
      <div className="py-5">
        <TrackComponent
          title="RMS"
          stages={[
            {
              label: '1. Raw Material Supplier (RMS)',
              data: trackedId !== null ? rms[parseInt(med[trackedId]?.RMSid)] : undefined,
              showArrow: false,
              icon: stageIcons.rms,
              stageIndex: 1
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillOrdered) {
    return (
      <div className="py-5">
        <TrackComponent
          title="Ordered"
          stages={[
            {
              label: 'Materials have not been processed at any stage yet...',
              showArrow: false,
              stageIndex: 0
            },
          ]}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Product Provenance & Tracking
              </h1>
              <p className="text-gray-400 text-base mt-1">Trace shipment origin, verification history, and lifecycle status on the Blockchain</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all duration-300 flex items-center font-extrabold text-base cursor-pointer hover:scale-[1.01]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard Home
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-sm font-mono text-gray-400">
          <span>Connected Wallet Address:</span>
          <span className="text-purple-400 select-all font-bold">{currentAccount}</span>
        </div>
      </div>

      {/* Search Filter input */}
      <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6 relative overflow-hidden group">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-white">Track Material Shipments</h2>
        </div>
        
        <form onSubmit={handlerSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 font-mono text-base font-extrabold">ID</span>
            </div>
            <input
              className="w-full pl-12 pr-4 py-5 bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-purple-500/50 rounded-xl focus:ring-1 focus:ring-purple-500/30 text-white placeholder-gray-500 transition-all duration-300 text-lg font-semibold"
              type="text"
              onChange={handlerChangeID}
              placeholder="Enter product ID (e.g. 1, 2, 3...)"
              value={id}
              required
            />
          </div>
          <button
            type="submit"
            className="px-8 py-5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-extrabold text-lg rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            Trace Lifecycle
          </button>
        </form>
      </div>

      {/* Available materials list */}
      <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] shadow-2xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Available Materials
          </h2>
          <span className="text-sm text-gray-400 font-mono font-semibold">
            Total Count: <span className="text-purple-400 font-extrabold">{Object.keys(med).length}</span> items
          </span>
        </div>
        
        {Object.keys(med).length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-400 text-lg font-semibold">No materials are currently available for tracking.</p>
            <p className="text-gray-500 text-sm mt-2">Please create some material orders first to start tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] text-base">
            <table className="min-w-full divide-y divide-white/[0.06]">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">Material ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">Material Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">Current Stage</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] bg-white/[0.005]">
                {Object.keys(med).map((key) => {
                  const medicineId = parseInt(key)
                  const stage = medStage[medicineId]
                  
                  const getStageColorClass = (stg: string) => {
                    if (stg.includes('Ordered')) return 'border-blue-500/30 bg-blue-500/10 text-blue-400 glow-blue'
                    if (stg.includes('Raw Material')) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 glow-green'
                    if (stg.includes('Manufacturing')) return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 glow-yellow'
                    if (stg.includes('Distribution')) return 'border-purple-500/30 bg-purple-500/10 text-purple-400 glow-purple'
                    if (stg.includes('Retail')) return 'border-orange-500/30 bg-orange-500/10 text-orange-400 glow-orange'
                    if (stg.includes('Sold')) return 'border-red-500/30 bg-red-500/10 text-red-400 glow-red'
                    return 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                  }
                  
                  return (
                    <tr key={key} className="hover:bg-white/[0.02] transition-colors duration-200 cursor-pointer" onClick={() => trackMedicine(medicineId)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-50/20 to-pink-50/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-400 font-mono font-extrabold mr-3">
                            {med[medicineId].id}
                          </div>
                          <span className="font-bold text-gray-200">ID: {med[medicineId].id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-200">{med[medicineId].name}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">{med[medicineId].description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-extrabold border ${getStageColorClass(stage)}`}>
                          {stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            trackMedicine(medicineId)
                          }}
                          className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all text-sm font-extrabold flex items-center gap-2 shadow-md shadow-purple-500/10 cursor-pointer hover:scale-[1.02]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
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



