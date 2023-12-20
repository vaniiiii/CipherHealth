import React from "react";

const DoctorForm = () => {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-base-200 rounded-xl shadow-lg my-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Calculate Commitment</h2>
      <form className="flex flex-col gap-3">
        <input className="input input-bordered" type="text" placeholder="Health Record ID" />
        <input className="input input-bordered" type="text" placeholder="Commitment" />
        <input className="input input-bordered" type="text" placeholder="Patient Address" />
        <input className="input input-bordered" type="text" placeholder="Doctor Address" />
        <input className="input input-bordered" type="date" placeholder="End Timestamp" />
        <input className="input input-bordered" type="text" placeholder="Marker" />
        <input className="input input-bordered" type="text" placeholder="Salt" />
        <button className="btn btn-primary mt-3">Calculate Commitment</button>
      </form>
    </div>
  );
};

export default DoctorForm;
