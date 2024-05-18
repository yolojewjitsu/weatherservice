import React from "react";

function Spinner() {
  return (
    <div data-testid="spinner" className="fixed top-0 right-0 bottom-0 left-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
    </div>
  );
}


export default Spinner;
