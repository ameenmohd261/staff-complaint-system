import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';

const Spinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
    <BootstrapSpinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </BootstrapSpinner>
  </div>
);

export default Spinner;