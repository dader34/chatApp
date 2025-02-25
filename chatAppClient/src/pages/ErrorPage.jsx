import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Determine error type and message
  const getErrorDetails = () => {
    if (error.status === 404) {
      return {
        title: '404 - Page Not Found',
        message: 'The page you are looking for does not exist or has been moved.',
        icon: '🔍'
      };
    } else if (error.status === 403) {
      return {
        title: '403 - Access Forbidden',
        message: 'You do not have permission to access this resource.',
        icon: '🔒'
      };
    } else if (error.status === 500) {
      return {
        title: '500 - Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        icon: '⚠️'
      };
    } else {
      return {
        title: 'Oops! Something went wrong',
        message: error.message || 'An unexpected error occurred. Please try again.',
        icon: '😕'
      };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <Container className="text-center py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="error-page my-5">
            <div className="error-icon mb-4">
              <span style={{ fontSize: '5rem' }}>{errorDetails.icon}</span>
            </div>
            <h1 className="mb-4">{errorDetails.title}</h1>
            <p className="lead mb-4 text-secondary">{errorDetails.message}</p>
            
            {error.stack && process.env.NODE_ENV === 'development' && (
              <div className="alert alert-danger text-start overflow-auto mt-4" style={{ maxHeight: '200px' }}>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{error.stack}</pre>
              </div>
            )}
            
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button variant="primary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button variant="outline-primary" onClick={() => navigate('/')}>
                Go Home
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ErrorPage;