import { useState } from "react";
import axios from "axios";
import "./App.css"; // Import custom CSS
import ReactMarkdown from "react-markdown";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error:", error);
      setSummary("Error generating summary.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Upload a PDF for Summary</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Summarize</button>

      {summary && (
        <div className="overflow">
          <h3>Summary:</h3>
          <p><ReactMarkdown>{summary}</ReactMarkdown></p>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
