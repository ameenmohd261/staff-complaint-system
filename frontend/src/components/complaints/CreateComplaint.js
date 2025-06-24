import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { createComplaintWithAttachments } from '../../actions/complaint';
import { getDepartments } from '../../actions/department';
import { Container, Card, Form, Button, Row, Col, ProgressBar, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane, faUpload } from '@fortawesome/free-solid-svg-icons';


const CreateComplaint = ({ 
  createComplaintWithAttachments, 
  getDepartments,
  department: { departments, loading }
}) => {
  const history = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { title, description, category, priority } = formData;

  useEffect(() => {
    getDepartments();
  }, [getDepartments]);

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = e => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'text/plain'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} has an invalid file type. Only images, PDFs, Word documents, and text files are allowed.`);
        return false;
      }
      
      if (file.size > maxSize) {
        setError(`${file.name} is too large. Maximum file size is 5MB.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      setFiles(validFiles);
      
      // Create previews for images
      const newPreviews = validFiles.map(file => {
        if (file.type.startsWith('image/')) {
          return {
            name: file.name,
            url: URL.createObjectURL(file),
            isImage: true
          };
        } else {
          return {
            name: file.name,
            type: file.type,
            isImage: false
          };
        }
      });
      
      setPreview(newPreviews);
      setError('');
    } else {
      setFiles([]);
      setPreview([]);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate upload progress
    if (files.length > 0) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', title);
    formDataToSend.append('description', description);
    formDataToSend.append('category', category);
    formDataToSend.append('priority', priority);
    
    files.forEach(file => {
      formDataToSend.append('attachments', file);
    });
    
    try {
      await createComplaintWithAttachments(formDataToSend);
      history.push('/dashboard');
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Container>
      <div className="d-flex align-items-center mb-4">
        <Button 
          as={Link} 
          to="/dashboard" 
          variant="link" 
          className="ps-0 text-decoration-none"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Submit New Complaint</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={onSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={title}
                    onChange={onChange}
                    placeholder="Brief title for your complaint"
                    required
                    disabled={isSubmitting}
                  />
                  <Form.Text className="text-muted">
                    Provide a clear and concise title
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={priority}
                    onChange={onChange}
                    disabled={isSubmitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={category}
                onChange={onChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select Category</option>
                <option value="it_support">IT Support</option>
                <option value="hr_issues">HR Issues</option>
                <option value="facility">Facility Issues</option>
                <option value="equipment">Equipment Problems</option>
                <option value="software">Software Issues</option>
                <option value="security">Security Concerns</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={description}
                onChange={onChange}
                rows={6}
                placeholder="Provide detailed information about your complaint"
                required
                disabled={isSubmitting}
              />
              <Form.Text className="text-muted">
                Include all relevant details to help resolve your complaint quickly
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Attachments (Optional)</Form.Label>
              <Form.Control
                type="file"
                onChange={onFileChange}
                multiple
                disabled={isSubmitting}
              />
              <Form.Text className="text-muted">
                You can attach up to 5 files (max 5MB each). Accepted formats: Images, PDF, Word, Text
              </Form.Text>
              
              {files.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2">Selected files:</p>
                  <div className="d-flex flex-wrap">
                    {preview.map((file, index) => (
                      <div key={index} className="me-3 mb-3 file-preview">
                        {file.isImage ? (
                          <img 
                            src={file.url} 
                            alt={file.name} 
                            className="img-thumbnail" 
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="file-icon p-3 border rounded text-center">
                            <FontAwesomeIcon icon={faUpload} size="2x" className="mb-2" />
                            <p className="mb-0 small text-truncate" style={{ maxWidth: '100px' }}>
                              {file.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {uploadProgress > 0 && (
                <div className="mt-3">
                  <p className="mb-1">Uploading files...</p>
                  <ProgressBar 
                    now={uploadProgress} 
                    label={`${uploadProgress}%`} 
                    animated 
                  />
                </div>
              )}
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button 
                as={Link} 
                to="/dashboard" 
                variant="outline-secondary" 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

CreateComplaint.propTypes = {
  createComplaintWithAttachments: PropTypes.func.isRequired,
  getDepartments: PropTypes.func.isRequired,
  department: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  department: state.department
});

export default connect(
  mapStateToProps, 
  { createComplaintWithAttachments, getDepartments }
)(CreateComplaint);