import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { MetaHeader } from "~~/components/MetaHeader";
import { ContractUI } from "~~/components/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

const selectedContractStorageKey = "scaffoldEth2.selectedContract";
const contractNames = getContractNames();

// Define the allowed functions for the patient dashboard
const allowedFunctionsForPatient = ["issueNFT", "getHealthRecord", "verifyProof", "balanceOf"];

const PatientDashboard: React.FC = () => {
  const [selectedContract, setSelectedContract] = useLocalStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
  );

  return (
    <>
      <MetaHeader
        title="Patient Dashboard | Health Management"
        description="Manage your health records and interactions"
      />
      <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
        {contractNames.length === 0 ? (
          <p className="text-3xl mt-14">No patient contracts available!</p>
        ) : (
          <>
            {contractNames.length > 1 && (
              <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
                {contractNames.map(contractName => (
                  <button
                    className={`btn btn-secondary btn-sm font-thin ${
                      contractName === selectedContract ? "bg-base-300" : "bg-base-100"
                    }`}
                    key={contractName}
                    onClick={() => setSelectedContract(contractName)}
                  >
                    {contractName}
                  </button>
                ))}
              </div>
            )}
            {contractNames.map(contractName => (
              <ContractUI
                key={contractName}
                contractName={contractName}
                allowedFunctions={allowedFunctionsForPatient}
                className={contractName === selectedContract ? "" : "hidden"}
                dashboardType="patient"
              />
            ))}
          </>
        )}
      </div>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Health Record Management</h1>
        <p className="text-neutral">
          Access and manage your health records and related contracts.
          <br /> For more features, explore{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / pages / patient-dashboard.tsx
          </code>{" "}
        </p>
      </div>
    </>
  );
};

export default PatientDashboard;
