import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Tab } from 'react-bootstrap';
import ContractAdder from '../components/ContractAdder';
import BotStatusTile from '../components/BotStatusTile';
import SettingsModal from '../components/SettingsModal';
import { checkBotHealth } from '../utils/botDiagnostics';

export default function DeFiBotDashboard() {
  const [settings, setSettings] = useState({ rpc: "", proxy: "none" });
  const [showSettings, setShowSettings] = useState(false);
  const [bots, setBots] = useState([]);
  const [healthStatus, setHealthStatus] = useState({});

  useEffect(() => {
    const botEndpoints = {
      unibot: "/api/bots/unibot",
      gnosis: "/api/bots/gnosis",
      flashloan: "/api/bots/flashloan"
    };
    checkBotHealth(botEndpoints).then(setHealthStatus);
  }, []);

  function saveSettings(newConfig) {
    setSettings(newConfig);
    setShowSettings(false);
    fetch("/admin/settings.json", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
  }

  function addContract(contract) {
    console.log("Adding contract:", contract);
    // Save to backend or local state if needed
  }

  return (
    <Container fluid className="py-3" style={{ background: '#191b1f', minHeight: '100vh', color: '#fff' }}>
      <h2>DeFi Bot Admin Panel</h2>
      <Tab.Container defaultActiveKey="contracts">
        <Row>
          <Col md={2}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item><Nav.Link eventKey="contracts">Contracts</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="bots">Bots</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="deploy">Deployments</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="airdrops">Airdrops</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="settings">Settings</Nav.Link></Nav.Item>
            </Nav>
          </Col>
          <Col md={10}>
            <Tab.Content>
              <Tab.Pane eventKey="contracts">
                <Card bg="dark" text="white" className="mb-3 p-3">
                  <Card.Title>Integrated Contracts</Card.Title>
                  <ContractAdder onAdd={addContract} />
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="bots">
                <Card bg="dark" text="white" className="mb-3 p-3">
                  <Card.Title>Active Bots</Card.Title>
                  {Object.entries(healthStatus).map(([name, bot]) => (
                    <BotStatusTile key={name} bot={{ name, ...bot }} />
                  ))}
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="deploy">
                <Card bg="dark" text="white" className="p-3">
                  <Card.Title>Deployments & Launches</Card.Title>
                  <Button variant="warning">+ Token Launcher</Button>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="airdrops">
                <Card bg="dark" text="white" className="p-3">
                  <Card.Title>Airdrop Hunter & Claim</Card.Title>
                  <Button variant="info">+ Register New</Button>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="settings">
                <Card bg="dark" text="white" className="p-3">
                  <Card.Title>Settings</Card.Title>
                  <Button className="btn btn-main" onClick={() => setShowSettings(true)}>
                    Open Settings
                  </Button>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
      <SettingsModal
        show={showSettings}
        onHide={() => setShowSettings(false)}
        config={settings}
        onUpdate={saveSettings}
      />
    </Container>
  );
}