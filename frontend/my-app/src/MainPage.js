import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css"; // Import custom CSS
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UploadPage from "./UploadPage";

function App() {
    const [question, setQuestion] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const askChatbot = async () => {
        if (!question.trim()) return;

        setLoading(true);
        try {
            const res = await axios.get(
                `http://127.0.0.1:8000/ask?question=${encodeURIComponent(question)}`
            );
            setResponse(res.data.response);
        } catch (error) {
            console.error("Error:", error);
            setResponse("Error connecting to backend");
        }
        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent new line in textarea
            askChatbot();
        }
    }

    const openUploadWindow = () => {
        window.open(
            "/upload", // This will be a new route
            "_blank",
            "width=500,height=600"
        );
    };
    const openQuizWindow = () => {
        window.open(
            "/quiz", // This will be a new route
            "_blank",
            "width=500,height=600"
        );
    };
    return (

        <div className="container">
            <h1>AI Study Assistant</h1>
            <textarea
                className="input-box"
                placeholder="Ask a study-related question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyPress} // Detect Enter key
            />
            <button className="ask-button" onClick={askChatbot} disabled={loading}>
                {loading ? "Thinking..." : "Ask AI"}
            </button>
            {response && (
                <div className="answer-box">
                    <strong>Answer:</strong>
                    {/* Apply the class to the wrapping div instead of ReactMarkdown */}
                    <div className="markdown">
                        <ReactMarkdown>{response}</ReactMarkdown>
                    </div>
                </div>
            )}
            <div className="cards-container">


                <div className="card" onClick={openUploadWindow} style={{ cursor: "pointer" }}>
                    <h3>💡 Summary</h3>
                    <p>Revising right before bed can help retain information better.</p>
                </div>
                <div className="card" onClick={openQuizWindow} style={{ cursor: "pointer" }}>
                    <h3>🔎 Quizzzz</h3>
                    <p>Are you ready?</p>
                </div>


            </div>
        </div>//
    );
}

export default App;
