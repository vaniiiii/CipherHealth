// Home.tsx
import Link from "next/link";
import type { NextPage } from "next";
import { ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Cipher Health</span>
          </h1>
          {/* Removed the text here */}
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
                Prove your sickness to your boss and request sick days using the{" "}
                <Link href="/sick-leave" passHref className="link">
                  Sick Leave
                </Link>{" "}
                functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
