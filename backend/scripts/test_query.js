const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Checking contract status...");
  
  // Read deployment
  const deploymentsPath = path.join(__dirname, "../../client/src/deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  
  const chainId = "1337";
  const address = deployments.networks[chainId]?.SupplyChain?.address;
  console.log("Deployed address on chain 1337:", address);
  
  if (!address) {
    console.error("No deployment found for chain 1337");
    return;
  }
  
  try {
    const supplyChain = await ethers.getContractAt("contracts/SupplyChain.sol:SupplyChain", address);
    const ctr = await supplyChain.medicineCtr();
    console.log("Medicine count (medicineCtr):", ctr.toString());
    
    if (Number(ctr) > 0) {
      for (let i = 1; i <= Number(ctr); i++) {
        const med = await supplyChain.MedicineStock(i);
        console.log(`Medicine ID ${i}: name=${med.name}, stage=${med.stage.toString()}`);
        for (let j = 0; j <= Number(med.stage); j++) {
          const ts = await supplyChain.stageTimestamps(i, j);
          console.log(`  Stage ${j} timestamp:`, ts.toString(), ts > 0n ? new Date(Number(ts) * 1000).toLocaleString("vi-VN") : "0");
        }
      }
    } else {
      console.log("No medicines in stock on this deployment.");
    }
  } catch (error) {
    console.error("Error querying contract:", error);
  }
}

main();
