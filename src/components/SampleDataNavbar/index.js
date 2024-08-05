import React, { useState } from 'react';
import { IoMdArrowBack } from 'react-icons/io';
import './index.css';

const SampleDataNavbar = () => {
    const [showImportOptions, setShowImportOptions] = useState(false);
    const [sampleDatabases, setSampleDatabases] = useState([]);

    const backBtn = () => {
        window.history.back();
    };

    const importSampleDataBtn = () => {
        setShowImportOptions(true);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://127.0.0.1:5000/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    alert('File uploaded successfully');
                } else {
                    alert('Error uploading file');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error uploading file');
            }
        } else {
            alert('Please select a CSV file');
        }
    };

    const fetchSampleDatabases = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/sample-databases');
            const data = await response.json();
            setSampleDatabases(data.sample_databases);
        } catch (error) {
            console.error('Error fetching sample databases:', error);
        }
    };

    return (
        <div className="import-data-btn-container">
            <button type="button" className="btn btn-primary" onClick={backBtn}>
                <IoMdArrowBack />
                Back
            </button>
            <button type="button" onClick={importSampleDataBtn}>
                Import Sample Data
            </button>
            {showImportOptions && (
                <div className="import-options">
                    <h3>Select an Option:</h3>
                    <input type="file" accept=".csv" onChange={handleFileUpload} />
                    <button type="button" onClick={fetchSampleDatabases}>
                        List Sample Databases
                    </button>
                    {sampleDatabases.length > 0 && (
                        <ul>
                            {sampleDatabases.map((file, index) => (
                                <li key={index}>{file}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default SampleDataNavbar;
