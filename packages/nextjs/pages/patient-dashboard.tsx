// patient-dashboard.tsx
import React from "react";
import Link from "next/link";
import { ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";

const PatientDashboard: React.FC = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Patient Dashboard</span>
          </h1>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ShieldCheckIcon className="h-8 w-8 fill-secondary" />
              <p>
                Record your sickness markers using the{" "}
                <Link href="/sickness-marker" passHref className="link">
                  Sickness Marker
                </Link>{" "}
                feature.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <UsersIcon className="h-8 w-8 fill-secondary" />
              <p>
                View your health history and interactions with doctors in the{" "}
                <Link href="/health-records" passHref className="link">
                  Health Records
                </Link>{" "}
                section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;
