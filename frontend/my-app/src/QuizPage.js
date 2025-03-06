import { useState } from "react";
import axios from "axios";

function QuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);
  const [isQuizReady, setIsQuizReady] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    // Reset states when new file is selected
    setUploadMessage("");
    setDebugInfo(null);
    setIsQuizReady(false);
    setQuiz(null);
    setResult("");
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    setUploadMessage("Uploading PDF...");
    setDebugInfo(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload response:", res.data);
      
      setUploadMessage(`PDF uploaded successfully. Text length: ${res.data.text_length} characters. Generating quiz...`);
      setDebugInfo({
        uploadSuccess: true,
        textLength: res.data.text_length,
        summary: res.data.summary
      });
      
      // After successful upload, fetch the quiz
      fetchQuiz();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setUploadMessage(`Error uploading PDF: ${error.response?.data?.detail || error.message}`);
      setLoading(false);
      setDebugInfo({
        uploadSuccess: false,
        error: error.response?.data?.detail || error.message
      });
    }
  };

  const fetchQuiz = async () => {
    try {
      console.log("Fetching quiz...");
      const res = await axios.get("http://127.0.0.1:8000/generate-quiz");
      console.log("Quiz response:", res.data);
      
      if (res.data.error) {
        setUploadMessage(`Error: ${res.data.error}`);
        setQuiz([]);
        setIsQuizReady(false);
        setDebugInfo(prev => ({ 
          ...prev, 
          quizGeneration: { 
            success: false, 
            error: res.data.error 
          } 
        }));
      } else {
        // Handle the quiz data
        const quizData = res.data.quiz;
        
        if (Array.isArray(quizData) && quizData.length > 0) {
          setQuiz(quizData);
          setIsQuizReady(true);
          setUploadMessage("Quiz generated successfully!");
          setDebugInfo(prev => ({ 
            ...prev, 
            quizGeneration: { 
              success: true, 
              questionCount: quizData.length 
            } 
          }));
        } else {
          console.error("Quiz data is not a valid array:", quizData);
          setUploadMessage("Received invalid quiz format. Please try again.");
          setQuiz([]);
          setIsQuizReady(false);
          setDebugInfo(prev => ({ 
            ...prev, 
            quizGeneration: { 
              success: false, 
              error: "Invalid quiz format", 
              data: quizData 
            } 
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setUploadMessage(`Error fetching quiz: ${error.response?.data?.detail || error.message}`);
      setQuiz([]);
      setIsQuizReady(false);
      setDebugInfo(prev => ({ 
        ...prev, 
        quizGeneration: { 
          success: false, 
          error: error.response?.data?.detail || error.message 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (question, option) => {
    setAnswers((prev) => ({ ...prev, [question]: option }));
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length === 0) {
      alert("Please answer at least one question before submitting.");
      return;
    }
    
    setLoading(true);
    try {
      // Wrap answers in the format expected by the backend
      const answerData = { answers: answers };
      console.log("Submitting answers:", answerData);
      
      const res = await axios.post("http://127.0.0.1:8000/submit-quiz", answerData);
      setResult(res.data.result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setResult(`Error evaluating quiz: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>📖 AI-Generated Quiz</h2>

      <div style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
        <h3>Upload a PDF to Generate a Quiz</h3>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange}
            style={{ flex: "1" }}
          />
          <button 
            onClick={handleUpload} 
            style={{ 
              marginLeft: "10px", 
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading || !file}
          >
            {loading ? "Processing..." : "Upload & Generate Quiz"}
          </button>
        </div>
        
        {uploadMessage && (
          <div style={{ 
            padding: "10px", 
            backgroundColor: uploadMessage.includes("Error") ? "#ffebee" : "#e8f5e9",
            borderRadius: "4px",
            marginTop: "10px"
          }}>
            {uploadMessage}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Processing your request...</p>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            border: "5px solid #f3f3f3",
            borderTop: "5px solid #3498db",
            borderRadius: "50%",
            margin: "20px auto",
            animation: "spin 2s linear infinite"
          }}></div>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      ) : isQuizReady && quiz && quiz.length > 0 ? (
        <div>
          <h3>Your Quiz</h3>
          {quiz.map((q, index) => (
            <div key={index} style={{ 
              marginBottom: "20px", 
              textAlign: "left", 
              background: "#f5f5f5", 
              padding: "15px", 
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <h4 style={{ marginTop: 0 }}>{index + 1}. {q.question}</h4>
              {q.options.map((option, idx) => (
                <div key={idx} style={{ margin: "10px 0" }}>
                  <input
                    type="radio"
                    id={`question-${index}-option-${idx}`}
                    name={`question-${index}`}
                    value={option}
                    onChange={() => handleOptionChange(q.question, option)}
                    checked={answers[q.question] === option}
                  />
                  <label htmlFor={`question-${index}-option-${idx}`} style={{ marginLeft: "10px" }}>
                    {option}
                  </label>
                </div>
              ))}
            </div>
          ))}

          <button 
            onClick={submitQuiz} 
            style={{ 
              display: "block",
              margin: "20px auto",
              padding: "10px 25px", 
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Submit Quiz
          </button>
        </div>
      ) : (
        !loading && (
          <div style={{ 
            padding: "20px", 
            textAlign: "center", 
            border: "1px dashed #ccc",
            borderRadius: "8px",
            color: "#666"
          }}>
            <p>Please upload a PDF to generate a quiz.</p>
          </div>
        )
      )}

      {result && (
        <div style={{ 
          marginTop: "20px", 
          background: "#f9f9f9", 
          padding: "20px", 
          borderRadius: "8px", 
          border: "1px solid #ddd",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3>Quiz Results</h3>
          <div style={{ whiteSpace: "pre-line" }}>{result}</div>
        </div>
      )}

      {debugInfo && (
        <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }}>
          <h4 style={{ marginTop: 0 }}>Debug Information (Development Only)</h4>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default QuizPage;