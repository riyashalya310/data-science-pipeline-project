import { IoMdArrowBack } from 'react-icons/io';
import "./index.css";

const SampleDataNavbar = () => {
    const backBtn = () => {
        window.history.back();
      };

    const importSampleDataBtn=()=>{
        
    }
  return (
    <div className="import-data-btn-container">
      <button type="button" className="btn btn-primary" onClick={backBtn}>
        <IoMdArrowBack />
        Back
      </button>
      <button type="button">Import Sample Data</button>
    </div>
  );
};

export default SampleDataNavbar;
