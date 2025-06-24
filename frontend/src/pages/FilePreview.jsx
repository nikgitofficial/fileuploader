import React, { useEffect, useState } from 'react';
import axios from '../api/axios'; // adjust path as needed
import { useParams } from 'react-router-dom';

const FilePreview = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      const res = await axios.get(`/files/${id}`);
      setFile(res.data);
    };
    fetchFile();
  }, [id]);

  if (!file) return <p>Loading preview...</p>;

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return <img src={file.url} alt={file.filename} style={{ maxWidth: '100%' }} />;
    } else if (file.type === 'application/pdf') {
      return (
        <iframe
          src={file.url}
          title="PDF Preview"
          width="100%"
          height="600px"
        />
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video controls width="100%">
          <source src={file.url} type={file.type} />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <a href={file.url} target="_blank" rel="noopener noreferrer">
          Open File
        </a>
      );
    }
  };

  return (
    <div>
      <h2>Preview: {file.filename}</h2>
      {renderPreview()}
    </div>
  );
};

export default FilePreview;
