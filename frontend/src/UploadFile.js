import React, { useState } from 'react';

function UploadFile() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (endpoint) => {
    if (!file) return alert('Please select a file.');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    let url = `http://localhost:8000/${endpoint}/`;

    if (endpoint === 'ask') {
      if (!question) return alert('Please enter a question.');
      formData.append('question', question);
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResponse(data?.response || JSON.stringify(data));
    } catch (err) {
      console.error(err);
      setResponse('Error occurred while connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>📄 Gemini PDF Assistant</h2>

      <input type="file" accept=".pdf,image/*" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Ask a question about the file"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={styles.input}
      />

      <div style={styles.buttonGroup}>
        <button onClick={() => handleUpload('upload')}>Extract Text</button>
        <button onClick={() => handleUpload('summarize')}>Summarize</button>
        <button onClick={() => handleUpload('tags')}>Get Tags</button>
        <button onClick={() => handleUpload('ask')}>Ask Question</button>
        <button onClick={() => handleUpload('analyze-image')}>Analyze Image</button>
      </div>

      {loading && <p>⏳ Processing...</p>}

      {response && (
        <div style={styles.responseBox}>
          <h4>🔍 Response:</h4>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial',
    maxWidth: '600px',
    margin: 'auto',
  },
  input: {
    width: '100%',
    marginTop: '10px',
    padding: '8px',
    fontSize: '14px',
  },
  buttonGroup: {
    marginTop: '15px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  responseBox: {
    marginTop: '20px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
    whiteSpace: 'pre-wrap',
  },
};

export default UploadFile;