<% if (styleFramework === 'bootstrap') { %>
import { Row, Col, Spinner, Container } from 'react-bootstrap';

export default function SuspenseFallback() {
  return (
    <Container className="h-100 w-100 d-flex flex-column justify-content-center">
      <Row>
        <Col className="text-center">
          <h1>Loading...</h1>
        </Col>
      </Row>
      <Row>
        <Col className="text-center">
          <Spinner animation="border" className="my-3" />
        </Col>
      </Row>
    </Container>
  );
}
<% } else if (styleFramework === 'foundation') { %>
import { Cell, Grid, GridContainer } from 'react-foundation';

export default function SuspenseFallback() {
  return (
    <GridContainer>
      <Grid>
        <Cell className="text-center" small={12}>
          <h1>Loading...</h1>
        </Cell>
      </Grid>
    </GridContainer>
  );
}
<% } else if (styleFramework === 'materialize') { %>
import { Col, Container, Preloader, Row } from 'react-materialize';

export default function SuspenseFallback() {
  return (
    <Container>
      <Row>
        <Col className="center-align" s={12}>
          <h1>Loading...</h1>
        </Col>
      </Row>
      <Row>
        <Col className="center-align" s={12}>
          <Preloader active color="blue" size="big" />
        </Col>
      </Row>
    </Container>
  );
}
<% } else if (styleFramework === 'uikit') { %>
import { Container, Section } from 'uikit-react';

export default function SuspenseFallback() {
  return (
    <Section>
      <Container className="uk-text-center">
        <h1>Loading...</h1>
      </Container>
    </Section>
  );
}
<% } else if (styleFramework === 'materialUi') { %>
import { Box, CircularProgress, Container, Typography } from '@mui/material';

export default function SuspenseFallback() {
  return (
    <Container>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h4">Loading...</Typography>
        <CircularProgress sx={{ my: 3 }} />
      </Box>
    </Container>
  );
}
<% } else { %>
export default function SuspenseFallback() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    </div>
  );
}
<% } %>