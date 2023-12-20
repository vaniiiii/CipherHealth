import { useEffect } from "react";
import type { NextPage } from "next";
import { useLocalStorage } from "usehooks-ts";
import { MetaHeader } from "~~/components/MetaHeader";
import { ContractUI } from "~~/components/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

const selectedContractStorageKey = "scaffoldEth2.selectedContract";
const contractNames = getContractNames();

// Define the allowed functions for the doctor dashboard
const allowedFunctionsForDoctor = ["addHealthRecord", "registerDoctor", "registerOperator", "getHealthRecord"];

const DoctorDashboard: NextPage = () => {
  const [selectedContract, setSelectedContract] = useLocalStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
  );

  useEffect(() => {
    if (!contractNames.includes(selectedContract)) {
      setSelectedContract(contractNames[0]);
    }
  }, [selectedContract, setSelectedContract]);

  return (
    <>
      <MetaHeader
        title="Doctor Dashboard | Medical Management"
        description="Easily manage your medical contracts and patient data"
      />
      <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
        {contractNames.length === 0 ? (
          <p className="text-3xl mt-14">No patient data available!</p>
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
                allowedFunctions={allowedFunctionsForDoctor} // Pass allowed functions for doctors
                className={contractName === selectedContract ? "" : "hidden"}
              />
            ))}
          </>
        )}
      </div>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Patient Contract Management</h1>
        <p className="text-neutral">
          Interact and manage your contracts related to patient care and services.
          <br /> Explore features in{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / pages / doctor-dashboard.tsx
          </code>{" "}
        </p>
      </div>
    </>
  );
};

export default DoctorDashboard;
