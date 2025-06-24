import React, { useState, useEffect } from 'react';
import { 
  Layout, Button, Typography, Row, Col, Card, Statistic, 
  Space, Divider, Avatar, Carousel, List, Collapse, BackTop,
  Badge, Tag, Menu, Drawer, Input
} from 'antd';
import { 
  RightOutlined, CheckCircleFilled, UserOutlined, 
  CommentOutlined, LaptopOutlined, MobileFilled,
  MenuOutlined, ArrowRightOutlined, GithubOutlined,
  LinkedinOutlined, TwitterOutlined, FacebookOutlined,
  MailOutlined, PhoneOutlined, EnvironmentOutlined,
  GlobalOutlined, CalendarOutlined,
  CloseOutlined,
  HomeOutlined,
  AppstoreOutlined,
  StarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import moment from 'moment';
import Form from 'antd/es/form/Form';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Search } = Input;

// Styled Components
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  overflow-x: hidden;
`;

const StyledHeader = styled(Header)`
  position: fixed;
  z-index: 1000;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 50px;
  
  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 22px;
  font-weight: 700;
  color: #1890ff;

  img {
    height: 36px;
    margin-right: 10px;
  }
`;

const NavMenu = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuToggle = styled(Button)`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const HeroSection = styled.div`
  padding: 150px 50px 100px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: white;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 120px 20px 80px;
  }
`;

const StyledContent = styled(Content)`
  overflow: hidden;
`;

const FeatureSection = styled.div`
  padding: 80px 50px;
  
  @media (max-width: 768px) {
    padding: 50px 20px;
  }
`;

const FeatureCard = styled(Card)`
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
  }
`;

const StatsSection = styled.div`
  padding: 80px 50px;
  background-color: #f7f9fc;
  
  @media (max-width: 768px) {
    padding: 50px 20px;
  }
`;

const TestimonialSection = styled.div`
  padding: 80px 50px;
  background: #fff;
  
  @media (max-width: 768px) {
    padding: 50px 20px;
  }
`;

const TestimonialCard = styled.div`
  padding: 30px;
  margin: 15px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: left;
`;

const CTASection = styled.div`
  padding: 100px 50px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: white;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const StyledFooter = styled(Footer)`
  background: #001529;
  color: rgba(255, 255, 255, 0.65);
  padding: 60px 50px 20px;
  
  @media (max-width: 768px) {
    padding: 40px 20px 20px;
  }
`;

const FooterSection = styled.div`
  margin-bottom: 40px;
`;

const FooterHeading = styled(Title)`
  color: white !important;
  margin-bottom: 20px !important;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;

const SocialIcon = styled.a`
  font-size: 20px;
  color: rgba(255, 255, 255, 0.65);
  transition: color 0.3s;
  
  &:hover {
    color: #1890ff;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const HomePage = () => {
  const [visible, setVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    // Set current date in the format: June 24, 2025
    setCurrentDate(moment().format('MMMM D, YYYY'));
  }, []);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setVisible(false);
  };

  return (
    <StyledLayout>
      <BackTop />
      
    {/* Enhanced Professional Header with Navigation */}
    <StyledHeader className={window.scrollY > 50 ? "scrolled" : ""}>
        <Logo>
            {/* <img src="/logo192.png" alt="ComplaintHub Logo" /> */}
            <span className="logo-text">ComplaintHub</span>
        </Logo>
        
        <NavMenu>
            <Menu 
                mode="horizontal" 
                style={{ border: 'none', fontSize: '16px', fontWeight: '500' }}
                selectedKeys={[window.location.hash.slice(1) || 'hero']}
            >
                <Menu.Item key="hero" onClick={() => scrollToSection('hero')}>
                    Home
                </Menu.Item>
                <Menu.Item key="features" onClick={() => scrollToSection('features')}>
                    Features
                </Menu.Item>
                <Menu.Item key="about" onClick={() => scrollToSection('about')}>
                    About Us
                </Menu.Item>
                <Menu.Item key="testimonials" onClick={() => scrollToSection('testimonials')}>
                    testimonials
                </Menu.Item>
                <Menu.Item key="contact" onClick={() => scrollToSection('contact')}>
                    contact
                </Menu.Item>
               
            </Menu>
        </NavMenu>
        
        <Space className="header-buttons">
            <Link to="/login">
                <Button 
                    type="primary" 
                    shape="round" 
                    size="large"
                    className="login-button"
                    icon={<UserOutlined />}
                >
                    Login
                </Button>
            </Link>
            <Link to="/register">
                <Button 
                    shape="round" 
                    size="large" 
                    className="register-button"
                >
                    Register
                </Button>
            </Link>
            <MobileMenuToggle 
                type="text" 
                icon={<MenuOutlined />} 
                onClick={showDrawer} 
                className="menu-toggle"
            />
        </Space>
        
        {/* Enhanced Mobile Menu Drawer */}
        <Drawer
            title={null}
            placement="right"
            closable={true}
            onClose={onClose}
            open={visible}
            width={300}
            className="mobile-drawer"
            headerStyle={{ display: 'none' }}
            bodyStyle={{ padding: '30px 20px' }}
        >
            <div className="drawer-header">
                <Logo style={{ fontSize: '20px', marginBottom: '20px' }}>
                    <img src="/logo192.png" alt="Logo" style={{ height: '32px' }} />
                    <span className="logo-text">ComplaintHub</span>
                </Logo>
                <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    onClick={onClose}
                    className="close-drawer"
                />
            </div>
            
            <Menu 
                mode="vertical" 
                style={{ border: 'none', fontSize: '16px', marginTop: '20px' }}
                selectedKeys={[window.location.hash.slice(1) || 'hero']}
            >
                <Menu.Item key="hero" onClick={() => scrollToSection('hero')} icon={<HomeOutlined />}>
                    Home
                </Menu.Item>
                <Menu.Item key="features" onClick={() => scrollToSection('features')} icon={<AppstoreOutlined />}>
                    Features
                </Menu.Item>
                <Menu.Item key="about" onClick={() => scrollToSection('about')} icon={<InfoCircleOutlined />}>
                    About Us
                </Menu.Item>
                <Menu.Item key="testimonials" onClick={() => scrollToSection('testimonials')} icon={<StarOutlined />}>
                    Testimonials
                </Menu.Item>
                <Menu.Item key="contact" onClick={() => scrollToSection('contact')} icon={<MailOutlined />}>
                    Contact
                </Menu.Item>
            </Menu>
            
            <div className="drawer-footer">
                <Link to="/login">
                    <Button type="primary" block size="large" icon={<UserOutlined />} style={{ marginBottom: '10px' }}>
                        Login
                    </Button>
                </Link>
                <Link to="/register">
                    <Button block size="large">
                        Register
                    </Button>
                </Link>
            </div>
        </Drawer>
    </StyledHeader>

    <StyledContent>
        {/* Hero Section */}
        <HeroSection id="hero">
          <Row justify="center">
            <Col xs={24} md={18} lg={16} xl={14}>
              <Badge.Ribbon text={currentDate} color="#722ed1">
                <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '24px' }}>
                  Streamline Your Customer Complaint Management
                </Title>
              </Badge.Ribbon>
              <Paragraph style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '40px' }}>
                A powerful platform that helps businesses efficiently track, manage, and resolve customer complaints
                while improving satisfaction and retention.
              </Paragraph>
              <Space size="large">
                <Link to="/register">
                  <Button type="primary" size="large" shape="round" style={{ height: '50px', padding: '0 35px', fontSize: '16px' }}>
                    Get Started <ArrowRightOutlined />
                  </Button>
                </Link>
                <Button size="large" shape="round" ghost style={{ height: '50px', padding: '0 35px', fontSize: '16px' }}>
                  Learn More
                </Button>
              </Space>
            </Col>
          </Row>
        </HeroSection>
        
        {/* Feature Section */}
        <FeatureSection id="features">
          <Row justify="center" style={{ marginBottom: '60px' }}>
            <Col xs={24} md={16} lg={14} xl={12} style={{ textAlign: 'center' }}>
              <Title>Powerful Features for Your Business</Title>
              <Paragraph style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.65)' }}>
                Our complaint management system offers everything you need to effectively handle customer issues
              </Paragraph>
            </Col>
          </Row>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <FeatureCard
                hoverable
                cover={
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff' }}>
                    <UserOutlined style={{ fontSize: '80px', color: '#1890ff' }} />
                  </div>
                }
              >
                <Card.Meta
                  title="User-Friendly Dashboard"
                  description="Intuitive interface for both customers and administrators with real-time updates and notifications."
                />
                <div style={{ marginTop: '20px' }}>
                  <Button type="link" style={{ padding: 0 }}>
                    Explore Features <RightOutlined />
                  </Button>
                </div>
              </FeatureCard>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <FeatureCard
                hoverable
                cover={
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f0ff' }}>
                    <CommentOutlined style={{ fontSize: '80px', color: '#722ed1' }} />
                  </div>
                }
              >
                <Card.Meta
                  title="Seamless Communication"
                  description="Built-in messaging system for direct communication between customers and support staff."
                />
                <div style={{ marginTop: '20px' }}>
                  <Button type="link" style={{ padding: 0 }}>
                    Learn More <RightOutlined />
                  </Button>
                </div>
              </FeatureCard>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <FeatureCard
                hoverable
                cover={
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fff0' }}>
                    <LaptopOutlined style={{ fontSize: '80px', color: '#52c41a' }} />
                  </div>
                }
              >
                <Card.Meta
                  title="Comprehensive Analytics"
                  description="Advanced reporting tools to track performance, identify trends, and make data-driven decisions."
                />
                <div style={{ marginTop: '20px' }}>
                  <Button type="link" style={{ padding: 0 }}>
                    View Reports <RightOutlined />
                  </Button>
                </div>
              </FeatureCard>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <FeatureCard
                hoverable
                cover={
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff0f0' }}>
                    <MobileFilled style={{ fontSize: '80px', color: '#f5222d' }} />
                  </div>
                }
              >
                <Card.Meta
                  title="Mobile Responsive"
                  description="Access your complaint management system from any device, anywhere, anytime."
                />
                <div style={{ marginTop: '20px' }}>
                  <Button type="link" style={{ padding: 0 }}>
                    Try Mobile Version <RightOutlined />
                  </Button>
                </div>
              </FeatureCard>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <FeatureCard
                hoverable
                cover={
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffbe6' }}>
                    <CalendarOutlined style={{ fontSize: '80px', color: '#faad14' }} />
                  </div>
                }
              >
                <Card.Meta
                  title="Automated Workflows"
                  description="Set up automatic ticket assignment, escalations, and notifications to streamline processes."
                />
                <div style={{ marginTop: '20px' }}>
                  <Button type="link" style={{ padding: 0 }}>
                    Explore Automation <RightOutlined />
                  </Button>
                </div>
              </FeatureCard>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <FeatureCard
                hoverable
                cover={
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e6fffb' }}>
                    <GlobalOutlined style={{ fontSize: '80px', color: '#13c2c2' }} />
                  </div>
                }
              >
                <Card.Meta
                  title="Multi-Channel Support"
                  description="Integrate complaints from various channels including email, social media, and web forms."
                />
                <div style={{ marginTop: '20px' }}>
                  <Button type="link" style={{ padding: 0 }}>
                    View Integrations <RightOutlined />
                  </Button>
                </div>
              </FeatureCard>
            </Col>
          </Row>
        </FeatureSection>
        
        {/* Stats Section */}
        <StatsSection>
          <Row justify="center" style={{ marginBottom: '60px' }}>
            <Col xs={24} md={16} lg={14} xl={12} style={{ textAlign: 'center' }}>
              <Title>Trusted by Businesses Worldwide</Title>
              <Paragraph style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.65)' }}>
                Join thousands of organizations that rely on our platform
              </Paragraph>
            </Col>
          </Row>
          
          <Row gutter={[48, 48]} justify="center">
            <Col xs={12} md={6}>
              <Statistic 
                title={<span style={{ fontSize: '18px' }}>Happy Clients</span>}
                value={2500}
                valueStyle={{ color: '#1890ff', fontSize: '36px', fontWeight: 'bold' }}
                prefix={<CheckCircleFilled />}
                suffix="+"
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic 
                title={<span style={{ fontSize: '18px' }}>Complaints Resolved</span>}
                value={1.2}
                precision={1}
                valueStyle={{ color: '#52c41a', fontSize: '36px', fontWeight: 'bold' }}
                prefix={<CheckCircleFilled />}
                suffix="M+"
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic 
                title={<span style={{ fontSize: '18px' }}>Response Time</span>}
                value={4}
                valueStyle={{ color: '#722ed1', fontSize: '36px', fontWeight: 'bold' }}
                suffix="hrs"
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic 
                title={<span style={{ fontSize: '18px' }}>Customer Satisfaction</span>}
                value={98}
                valueStyle={{ color: '#fa8c16', fontSize: '36px', fontWeight: 'bold' }}
                suffix="%"
              />
            </Col>
          </Row>
        </StatsSection>
        
        {/* About Section */}
        <FeatureSection id="about" style={{ background: '#fff' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <Title>About ComplaintHub</Title>
              <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                ComplaintHub was founded in 2020 with a mission to revolutionize how businesses handle customer complaints.
                We believe that effective complaint management is crucial for customer retention and business growth.
              </Paragraph>
              <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                Our team of experienced developers and customer service experts has created a platform that not only
                helps resolve complaints efficiently but also turns them into opportunities for improvement.
              </Paragraph>
              <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                Today, ComplaintHub serves businesses of all sizes across various industries, helping them
                deliver exceptional customer service and maintain high satisfaction rates.
              </Paragraph>
              <Button type="primary" size="large">
                Learn More About Us
              </Button>
            </Col>
            <Col xs={24} md={12}>
              <img 
                src="https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="About Us"
                style={{ width: '100%', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
              />
            </Col>
          </Row>
        </FeatureSection>
        
        {/* Testimonial Section */}
        <TestimonialSection id="testimonials">
          <Row justify="center" style={{ marginBottom: '60px' }}>
            <Col xs={24} md={16} lg={14} xl={12} style={{ textAlign: 'center' }}>
              <Title>What Our Clients Say</Title>
              <Paragraph style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.65)' }}>
                Hear from businesses that have transformed their customer service with our platform
              </Paragraph>
            </Col>
          </Row>
          
          <Carousel autoplay dots={{ className: 'custom-carousel-dots' }}>
            <div>
              <Row gutter={[24, 24]} justify="center">
                <Col xs={24} sm={12} md={8}>
                  <TestimonialCard>
                    <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                      "ComplaintHub has completely transformed how we handle customer complaints. The platform is intuitive, and the automated workflows have saved our team countless hours."
                    </div>
                    <Space>
                      <Avatar size={64} src="https://randomuser.me/api/portraits/women/44.jpg" />
                      <div>
                        <Text strong style={{ display: 'block' }}>Sarah Johnson</Text>
                        <Text type="secondary">Customer Service Director, TechCorp</Text>
                      </div>
                    </Space>
                  </TestimonialCard>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <TestimonialCard>
                    <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                      "The analytics and reporting features provide invaluable insights that have helped us identify recurring issues and make necessary improvements to our products."
                    </div>
                    <Space>
                      <Avatar size={64} src="https://randomuser.me/api/portraits/men/32.jpg" />
                      <div>
                        <Text strong style={{ display: 'block' }}>Michael Chen</Text>
                        <Text type="secondary">Operations Manager, GlobalRetail</Text>
                      </div>
                    </Space>
                  </TestimonialCard>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <TestimonialCard>
                    <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                      "Since implementing ComplaintHub, our customer satisfaction rates have increased by 35%. The platform has truly been a game-changer for our business."
                    </div>
                    <Space>
                      <Avatar size={64} src="https://randomuser.me/api/portraits/women/68.jpg" />
                      <div>
                        <Text strong style={{ display: 'block' }}>Emma Rodriguez</Text>
                        <Text type="secondary">CEO, ServiceFirst</Text>
                      </div>
                    </Space>
                  </TestimonialCard>
                </Col>
              </Row>
            </div>
            <div>
              <Row gutter={[24, 24]} justify="center">
                <Col xs={24} sm={12} md={8}>
                  <TestimonialCard>
                    <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                      "The mobile responsiveness of ComplaintHub allows our team to respond to customer issues on the go, significantly reducing our average response time."
                    </div>
                    <Space>
                      <Avatar size={64} src="https://randomuser.me/api/portraits/men/75.jpg" />
                      <div>
                        <Text strong style={{ display: 'block' }}>David Wilson</Text>
                        <Text type="secondary">Support Team Lead, MobileSolutions</Text>
                      </div>
                    </Space>
                  </TestimonialCard>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <TestimonialCard>
                    <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                      "As a small business, we needed an affordable solution that wouldn't compromise on features. ComplaintHub delivered exactly that and more."
                    </div>
                    <Space>
                      <Avatar size={64} src="https://randomuser.me/api/portraits/women/90.jpg" />
                      <div>
                        <Text strong style={{ display: 'block' }}>Jennifer Lee</Text>
                        <Text type="secondary">Owner, Boutique Retail</Text>
                      </div>
                    </Space>
                  </TestimonialCard>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <TestimonialCard>
                    <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                      "The implementation process was smooth, and the customer support from the ComplaintHub team has been exceptional. They truly care about our success."
                    </div>
                    <Space>
                      <Avatar size={64} src="https://randomuser.me/api/portraits/men/22.jpg" />
                      <div>
                        <Text strong style={{ display: 'block' }}>Robert Taylor</Text>
                        <Text type="secondary">IT Director, HealthServices</Text>
                      </div>
                    </Space>
                  </TestimonialCard>
                </Col>
              </Row>
            </div>
          </Carousel>
        </TestimonialSection>
        
        {/* FAQ Section */}
        <FeatureSection style={{ background: '#f7f9fc' }}>
          <Row justify="center" style={{ marginBottom: '60px' }}>
            <Col xs={24} md={16} lg={14} xl={12} style={{ textAlign: 'center' }}>
              <Title>Frequently Asked Questions</Title>
              <Paragraph style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.65)' }}>
                Find answers to common questions about our platform
              </Paragraph>
            </Col>
          </Row>
          
          <Row justify="center">
            <Col xs={24} md={20} lg={18} xl={16}>
              <Collapse bordered={false} expandIconPosition="right">
                <Panel header="What makes ComplaintHub different from other complaint management systems?" key="1">
                  <Paragraph>
                    ComplaintHub stands out with its user-friendly interface, powerful automation capabilities, and comprehensive analytics. 
                    Our platform is designed to be flexible enough for businesses of all sizes while providing enterprise-grade features.
                    Additionally, our focus on multi-channel integration allows you to capture complaints from various sources in one central system.
                  </Paragraph>
                </Panel>
                <Panel header="Is ComplaintHub suitable for small businesses?" key="2">
                  <Paragraph>
                    Absolutely! ComplaintHub offers flexible pricing plans that scale with your business. Our platform is designed to be 
                    intuitive and easy to use, requiring minimal training. Small businesses can benefit from our core features without being 
                    overwhelmed by unnecessary complexity.
                  </Paragraph>
                </Panel>
                <Panel header="How long does it take to implement ComplaintHub?" key="3">
                  <Paragraph>
                    Most businesses can get up and running with ComplaintHub within 1-2 days. Our standard implementation includes system setup, 
                    basic configuration, and user training. For larger organizations with specific customization needs, the process might take 
                    1-2 weeks. Our support team is available throughout the implementation to ensure a smooth transition.
                  </Paragraph>
                </Panel>
                <Panel header="Can ComplaintHub integrate with our existing CRM system?" key="4">
                  <Paragraph>
                    Yes, ComplaintHub offers integration capabilities with popular CRM systems including Salesforce, HubSpot, and Microsoft Dynamics. 
                    We also provide an API for custom integrations with your proprietary systems. Our team can assist with integration setup to ensure 
                    seamless data flow between ComplaintHub and your existing tools.
                  </Paragraph>
                </Panel>
                <Panel header="What kind of support does ComplaintHub offer?" key="5">
                  <Paragraph>
                    We provide multiple tiers of support depending on your needs. All plans include email support with a 24-hour response time. 
                    Our Premium and Enterprise plans include phone support during business hours and a dedicated account manager. We also offer 
                    comprehensive documentation, video tutorials, and regular webinars to help you get the most out of our platform.
                  </Paragraph>
                </Panel>
              </Collapse>
            </Col>
          </Row>
        </FeatureSection>
        
        {/* CTA Section */}
        <CTASection>
          <Row justify="center">
            <Col xs={24} md={16} lg={14} xl={12} style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
                Ready to Transform Your Complaint Management?
              </Title>
              <Paragraph style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '40px' }}>
                Join thousands of satisfied businesses and start improving your customer service today.
              </Paragraph>
              <Space size="large">
                <Link to="/register">
                  <Button type="primary" size="large" shape="round" style={{ height: '50px', padding: '0 35px', fontSize: '16px', background: 'white', color: '#1890ff', borderColor: 'white' }}>
                    Start Your Free Trial
                  </Button>
                </Link>
                <Button ghost size="large" shape="round" style={{ height: '50px', padding: '0 35px', fontSize: '16px' }}>
                  Schedule a Demo
                </Button>
              </Space>
            </Col>
          </Row>
        </CTASection>
        
        {/* Contact Section */}
        <FeatureSection id="contact" style={{ background: '#fff' }}>
          <Row justify="center" style={{ marginBottom: '60px' }}>
            <Col xs={24} md={16} lg={14} xl={12} style={{ textAlign: 'center' }}>
              <Title>Get in Touch</Title>
              <Paragraph style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.65)' }}>
                Have questions or need assistance? We're here to help!
              </Paragraph>
            </Col>
          </Row>
          
          <Row gutter={[48, 48]}>
            <Col xs={24} md={12}>
              <Card bordered={false} style={{ height: '100%' }}>
                <Title level={3}>Contact Information</Title>
                <List itemLayout="horizontal">
                  <List.Item>
                    <List.Item.Meta
                      avatar={<MailOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                      title="Email"
                      description={<a href="mailto:info@complainthub.com">info@complainthub.com</a>}
                    />
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      avatar={<PhoneOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                      title="Phone"
                      description="+1 (555) 123-4567"
                    />
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      avatar={<EnvironmentOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                      title="Address"
                      description="123 Business Avenue, Tech City, CA 94043, USA"
                    />
                  </List.Item>
                </List>
                
                <Title level={4} style={{ marginTop: '30px' }}>Follow Us</Title>
                <Space size="large">
                  <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
                    <FacebookOutlined style={{ fontSize: '24px' }} />
                  </SocialIcon>
                  <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
                    <TwitterOutlined style={{ fontSize: '24px' }} />
                  </SocialIcon>
                  <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
                    <LinkedinOutlined style={{ fontSize: '24px' }} />
                  </SocialIcon>
                  <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
                    <GithubOutlined style={{ fontSize: '24px' }} />
                  </SocialIcon>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card bordered={false} style={{ height: '100%' }}>
                <Title level={3}>Send Us a Message</Title>
                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Full Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
                        <Input placeholder="Your full name" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email', type: 'email' }]}>
                        <Input placeholder="Your email address" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item label="Subject" name="subject" rules={[{ required: true, message: 'Please enter a subject' }]}>
                    <Input placeholder="What is this regarding?" size="large" />
                  </Form.Item>
                  
                  <Form.Item label="Message" name="message" rules={[{ required: true, message: 'Please enter your message' }]}>
                    <Input.TextArea rows={4} placeholder="Your message" size="large" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" size="large" block>
                      Send Message
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </FeatureSection>
      </StyledContent>
      
      {/* Footer */}
      <StyledFooter>
        <Row gutter={[48, 48]}>
          <Col xs={24} md={8}>
            <FooterSection>
              <Logo style={{ color: 'white', marginBottom: '20px' }}>
                <img src="/logo192.png" alt="Logo" />
                ComplaintHub
              </Logo>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                A comprehensive complaint management platform designed to help businesses effectively handle customer issues
                and improve satisfaction rates.
              </Paragraph>
              <SocialIcons>
                <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
                  <FacebookOutlined />
                </SocialIcon>
                <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
                  <TwitterOutlined />
                </SocialIcon>
                <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
                  <LinkedinOutlined />
                </SocialIcon>
                <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
                  <GithubOutlined />
                </SocialIcon>
              </SocialIcons>
            </FooterSection>
          </Col>
          
          <Col xs={12} sm={8} md={5}>
            <FooterSection>
              <FooterHeading level={4}>Quick Links</FooterHeading>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Home</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#features" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Features</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#about" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>About</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#testimonials" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Testimonials</a></li>
                <li><a href="#contact" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Contact</a></li>
              </ul>
            </FooterSection>
          </Col>
          
          <Col xs={12} sm={8} md={5}>
            <FooterSection>
              <FooterHeading level={4}>Resources</FooterHeading>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Documentation</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Blog</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>FAQ</a></li>
                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>API Reference</a></li>
                <li><a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Video Tutorials</a></li>
              </ul>
            </FooterSection>
          </Col>
          
          <Col xs={24} sm={8} md={6}>
            <FooterSection>
              <FooterHeading level={4}>Subscribe</FooterHeading>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Stay updated with our latest news and features. Subscribe to our newsletter.
              </Paragraph>
              <Search
                placeholder="Your email address"
                allowClear
                enterButton="Subscribe"
                size="large"
                onSearch={(value) => console.log(value)}
              />
            </FooterSection>
          </Col>
        </Row>
        
        <Copyright>
          <div>© {new Date().getFullYear()} ComplaintHub. All rights reserved.</div>
          <div style={{ marginTop: '10px' }}>
            <Space split={<Divider type="vertical" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />}>
              <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Terms of Service</a>
              <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Cookie Policy</a>
            </Space>
          </div>
        </Copyright>
      </StyledFooter>
    </StyledLayout>
  );
};

export default HomePage;