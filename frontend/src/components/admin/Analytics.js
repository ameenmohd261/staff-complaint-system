import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getComplaints } from '../../actions/complaint';
import { getDepartments } from '../../actions/department';
import Spinner from '../layout/Spinner';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Bar, Pie, Line } from 'react-chartjs-2';
import moment from 'moment';

const Analytics = ({
  getComplaints,
  getDepartments,
  complaint: { complaints, loading: complaintsLoading },
  department: { departments, loading: departmentsLoading }
}) => {
  const [timeRange, setTimeRange] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({
    statusData: {
      labels: [],
      datasets: []
    },
    categoryData: {
      labels: [],
      datasets: []
    },
    departmentData: {
      labels: [],
      datasets: []
    },
    trendData: {
      labels: [],
      datasets: []
    },
    stats: {
      total: 0,
      avgResolutionTime: 0,
      percentOnTime: 0,
      highPriority: 0
    }
  });

  useEffect(() => {
    getComplaints();
    getDepartments();
  }, [getComplaints, getDepartments]);

  useEffect(() => {
    if (!complaintsLoading && !departmentsLoading && complaints.length > 0 && departments.length > 0) {
      generateAnalytics();
    }
  }, [complaintsLoading, departmentsLoading, complaints, departments, timeRange]);

  const generateAnalytics = () => {
    // Filter complaints based on time range
    const filteredComplaints = filterComplaintsByTimeRange(complaints, timeRange);
    
    // Status distribution
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      resolved: 0
    };
    
    filteredComplaints.forEach(complaint => {
      statusCounts[complaint.status]++;
    });
    
    const statusData = {
      labels: ['Pending', 'In Progress', 'Resolved'],
      datasets: [
        {
          data: [statusCounts.pending, statusCounts.in_progress, statusCounts.resolved],
          backgroundColor: ['#ffc107', '#0d6efd', '#198754'],
          borderWidth: 1
        }
      ]
    };
    
    // Category distribution
    const categoryMap = {};
    
    filteredComplaints.forEach(complaint => {
      if (!categoryMap[complaint.category]) {
        categoryMap[complaint.category] = 0;
      }
      categoryMap[complaint.category]++;
    });
    
    const categoryLabels = Object.keys(categoryMap).map(key => {
      const categoryNames = {
        it_support: 'IT Support',
        hr_issues: 'HR Issues',
        facility: 'Facility',
        equipment: 'Equipment',
        software: 'Software',
        security: 'Security',
        other: 'Other'
      };
      
      return categoryNames[key] || key;
    });
    
    const categoryData = {
      labels: categoryLabels,
      datasets: [
        {
          data: Object.values(categoryMap),
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#6f42c1', '#5a5c69'],
          borderWidth: 1
        }
      ]
    };
    
    // Department distribution
    const departmentMap = {};
    
    departments.forEach(dept => {
      departmentMap[dept.name] = 0;
    });
    
    filteredComplaints.forEach(complaint => {
      if (departmentMap[complaint.department] !== undefined) {
        departmentMap[complaint.department]++;
      }
    });
    
    const departmentData = {
      labels: Object.keys(departmentMap),
      datasets: [
        {
          label: 'Complaints by Department',
          data: Object.values(departmentMap),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    };
    
    // Time trend analysis
    const trendMap = {};
    const monthFormat = 'MMM YYYY';
    const monthsToShow = timeRange === 'month' ? 4 : 12;
    
    // Initialize with past X months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthKey = moment().subtract(i, 'months').format(monthFormat);
      trendMap[monthKey] = 0;
    }
    
    // Count complaints by month
    filteredComplaints.forEach(complaint => {
      const monthKey = moment(complaint.submittedDate).format(monthFormat);
      if (trendMap[monthKey] !== undefined) {
        trendMap[monthKey]++;
      }
    });
    
    const trendData = {
      labels: Object.keys(trendMap),
      datasets: [
        {
          label: 'Complaints Submitted',
          data: Object.values(trendMap),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
    
    // Calculate stats
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    let onTimeCount = 0;
    let highPriorityCount = 0;
    
    filteredComplaints.forEach(complaint => {
      if (complaint.priority === 'high') {
        highPriorityCount++;
      }
      
      if (complaint.status === 'resolved' && complaint.resolvedDate) {
        const submitDate = new Date(complaint.submittedDate);
        const resolveDate = new Date(complaint.resolvedDate);
        const timeDiff = resolveDate - submitDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        totalResolutionTime += daysDiff;
        resolvedCount++;
        
        // Assuming "on time" means resolved in 7 days or less
        if (daysDiff <= 7) {
          onTimeCount++;
        }
      }
    });
    
    const avgResolutionTime = resolvedCount > 0 
      ? (totalResolutionTime / resolvedCount).toFixed(1) 
      : 0;
    
    const percentOnTime = resolvedCount > 0 
      ? Math.round((onTimeCount / resolvedCount) * 100) 
      : 0;
    
    setAnalyticsData({
      statusData,
      categoryData,
      departmentData,
      trendData,
      stats: {
        total: filteredComplaints.length,
        avgResolutionTime,
        percentOnTime,
        highPriority: highPriorityCount
      }
    });
  };
  
  const filterComplaintsByTimeRange = (complaints, range) => {
    if (range === 'all') {
      return complaints;
    }
    
    const currentDate = new Date();
    let startDate;
    
    switch (range) {
      case 'week':
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        break;
      case 'quarter':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate());
        break;
      case 'year':
        startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
        break;
      default:
        return complaints;
    }
    
    return complaints.filter(complaint => new Date(complaint.submittedDate) >= startDate);
  };

  return (complaintsLoading || departmentsLoading) ? (
    <Spinner />
  ) : (
    <Container>
      <div className="d-flex align-items-center mb-4">
        <Button 
          as={Link} 
          to="/admin/dashboard" 
          variant="link" 
          className="ps-0 text-decoration-none"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Admin Dashboard
        </Button>
      </div>
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Complaint Analytics</h4>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
              <select 
                className="form-select form-select-sm" 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-left-primary h-100 py-2">
                <Card.Body>
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Complaints
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {analyticsData.stats.total}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-left-success h-100 py-2">
                <Card.Body>
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Avg. Resolution Time
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {analyticsData.stats.avgResolutionTime} days
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-left-info h-100 py-2">
                <Card.Body>
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        Resolved On Time
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {analyticsData.stats.percentOnTime}%
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-left-warning h-100 py-2">
                <Card.Body>
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        High Priority Complaints
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {analyticsData.stats.highPriority}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Complaint Status Distribution</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Pie 
                      data={analyticsData.statusData} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Complaints by Category</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Pie 
                      data={analyticsData.categoryData} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Complaint Trend Over Time</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Line 
                      data={analyticsData.trendData} 
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Complaints by Department</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={analyticsData.departmentData} 
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

Analytics.propTypes = {
  getComplaints: PropTypes.func.isRequired,
  getDepartments: PropTypes.func.isRequired,
  complaint: PropTypes.object.isRequired,
  department: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  complaint: state.complaint,
  department: state.department
});

export default connect(
  mapStateToProps, 
  { getComplaints, getDepartments }
)(Analytics);