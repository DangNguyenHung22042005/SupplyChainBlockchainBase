const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting supply chain flow test...");

  // Read deployment info
  const deploymentsPath = path.join(__dirname, "../../client/src/deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  
  const chainId = "1337";
  const address = deployments.networks[chainId]?.SupplyChain?.address;
  console.log("Contract address:", address);
  
  if (!address) {
    console.error("No deployment found");
    return;
  }

  const [owner, rmsSigner, manSigner, disSigner, retSigner] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("RMS address:", rmsSigner.address);
  console.log("MAN address:", manSigner.address);
  console.log("DIS address:", disSigner.address);
  console.log("RET address:", retSigner.address);

  try {
    const supplyChain = await ethers.getContractAt("contracts/SupplyChain.sol:SupplyChain", address);

    console.log("\n1. Registering roles (onlyByOwner)...");
    await (await supplyChain.connect(owner).addRMS(rmsSigner.address, "RMS Partner", "Hanoi")).wait();
    await (await supplyChain.connect(owner).addManufacturer(manSigner.address, "MAN Partner", "Bac Ninh")).wait();
    await (await supplyChain.connect(owner).addDistributor(disSigner.address, "DIS Partner", "Da Nang")).wait();
    await (await supplyChain.connect(owner).addRetailer(retSigner.address, "RET Partner", "HCM City")).wait();
    console.log("Roles registered successfully!");

    console.log("\n2. Adding a new medicine...");
    await (await supplyChain.connect(owner).addMedicine("Paracetamol", "A common painkiller")).wait();
    const medCtr = await supplyChain.medicineCtr();
    const currentId = Number(medCtr);
    console.log(`Medicine added successfully! ID: ${currentId}`);

    console.log("\n3. Simulating supply chain stages...");
    
    // Stage 1: RMSsupply
    console.log("Updating to Stage 1 (RMS supply)...");
    await (await supplyChain.connect(rmsSigner).RMSsupply(currentId)).wait();
    
    // Stage 2: Manufacturing
    console.log("Updating to Stage 2 (Manufacturing)...");
    await (await supplyChain.connect(manSigner).Manufacturing(currentId)).wait();

    // Stage 3: Distribute
    console.log("Updating to Stage 3 (Distribute)...");
    await (await supplyChain.connect(disSigner).Distribute(currentId)).wait();

    // Stage 4: Retail
    console.log("Updating to Stage 4 (Retail)...");
    await (await supplyChain.connect(retSigner).Retail(currentId)).wait();

    // Stage 5: Sold
    console.log("Updating to Stage 5 (Sold)...");
    await (await supplyChain.connect(retSigner).sold(currentId)).wait();

    console.log("\n4. Querying verification times...");
    const med = await supplyChain.MedicineStock(currentId);
    console.log(`Medicine Stage: ${med.stage.toString()}`);
    
    for (let j = 0; j <= 5; j++) {
      const ts = await supplyChain.stageTimestamps(currentId, j);
      console.log(`  Stage ${j} timestamp: ${ts.toString()} (${ts > 0n ? new Date(Number(ts) * 1000).toLocaleString("vi-VN") : "0"})`);
    }
  } catch (error) {
    console.error("Error in supply chain flow:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
