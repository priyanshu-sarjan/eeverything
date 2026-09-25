import express from 'express';
import cors from 'cors';
import { INDIAN_LOGISTICS_CORRIDORS } from './data/routesData.js';
import { INITIAL_SHIPMENTS } from './data/shipmentsData.js';
import { AVAILABLE_MICRO_DRIVERS } from './data/microVehiclesData.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database state
let shipments = [...INITIAL_SHIPMENTS];
let microDrivers = [...AVAILABLE_MICRO_DRIVERS];
let sseClients = [];

// Helper function to dynamically update IoT Telemetry & calculate Freshness & Spoilage
function updateIoTSimulation() {
  shipments = shipments.map(shipment => {
    if (shipment.status !== 'IN_TRANSIT' && shipment.status !== 'DISPATCHED') return shipment;
    if (!shipment.telemetry) return shipment;

    const t = { ...shipment.telemetry };
    
    // Simulate slight temp drift (-0.2 to +0.3°C)
    const tempDrift = (Math.random() * 0.5 - 0.2);
    t.currentTempC = parseFloat((t.currentTempC + tempDrift).toFixed(1));
    
    // If cooling booster active, cool down faster
    if (t.coolingSystemState === 'BOOSTER_COOLING_ACTIVE') {
      if (t.currentTempC > t.targetTempC) {
        t.currentTempC = parseFloat((t.currentTempC - 0.4).toFixed(1));
      } else {
        t.coolingSystemState = 'OPTIMAL_ACTIVE';
      }
    }

    // Dynamic ethylene gas accumulation for perishables if temp > max threshold
    if (t.currentTempC > t.maxTempThresholdC) {
      t.ethylenePpm = parseFloat((t.ethylenePpm + 0.05).toFixed(2));
      t.spoilageRiskScore = Math.min(100, parseFloat((t.spoilageRiskScore + 1.2).toFixed(1)));
      t.freshnessIndexPercent = Math.max(0, parseFloat((t.freshnessIndexPercent - 0.3).toFixed(1)));
    } else {
      // Temp is optimal
      t.spoilageRiskScore = Math.max(0.1, parseFloat((t.spoilageRiskScore - 0.2).toFixed(1)));
      t.freshnessIndexPercent = Math.max(0, parseFloat((t.freshnessIndexPercent - 0.02).toFixed(1)));
    }

    // Dynamic shelf life hours remaining recalculation based on Arrhenius principles
    const tempFactor = Math.max(0.5, 1 + (t.currentTempC - t.targetTempC) * 0.15);
    const gasFactor = 1 + (t.ethylenePpm / 2.0);
    const decayMultiplier = tempFactor * gasFactor;
    t.estimatedFreshnessHoursRemaining = Math.max(1, Math.round(t.estimatedFreshnessHoursRemaining / (1 + decayMultiplier * 0.001)));

    // Progress coordinates & ETA movement simulation
    let progress = shipment.progressPercent + (Math.random() * 0.4);
    if (progress >= 100) {
      progress = 100;
      shipment.status = 'DELIVERED';
    }
    shipment.progressPercent = parseFloat(progress.toFixed(1));
    shipment.etaHours = Math.max(0, parseFloat((shipment.etaHours - 0.05).toFixed(2)));

    return {
      ...shipment,
      telemetry: t
    };
  });

  // Broadcast to SSE clients
  notifySseClients({ type: 'TELEMETRY_UPDATE', shipments });
}

// Run IoT simulation ticker every 3.5 seconds
setInterval(updateIoTSimulation, 3500);

function notifySseClients(data) {
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// Server-Sent Events (SSE) Endpoint for real-time live telemetry
app.get('/api/live-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial data immediately
  res.write(`data: ${JSON.stringify({ type: 'INIT', shipments })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// GET /api/shipments - List all shipments
app.get('/api/shipments', (req, res) => {
  const { tier, status } = req.query;
  let filtered = [...shipments];
  if (tier) {
    filtered = filtered.filter(s => s.tier.toLowerCase().includes(tier.toLowerCase()));
  }
  if (status) {
    filtered = filtered.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }
  res.json({ success: true, count: filtered.length, data: filtered });
});

// GET /api/shipments/:id - Single Shipment
app.get('/api/shipments/:id', (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id || s.trackingNumber === req.params.id);
  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' });
  }
  res.json({ success: true, data: shipment });
});

// POST /api/shipments - Create New Shipment with automated priority tiering
app.post('/api/shipments', (req, res) => {
  const { commodity, quantity, origin, destination, isPerishable, cargoValueRs, transportMode } = req.body;

  if (!commodity || !origin || !destination) {
    return res.status(400).json({ success: false, message: 'Commodity, origin, and destination are required' });
  }

  const id = `SHIP-${isPerishable ? 'AGRI' : 'GEN'}-${Math.floor(100 + Math.random() * 900)}`;
  const trackingNumber = `IN-${isPerishable ? 'AGRI' : 'LOG'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Assign priority & tier automatically based on perishability & SLA
  let tier = "Tier 3: Standard Industrial Freight";
  let priorityLevel = "REGULAR PRIORITY";
  let telemetry = null;
  let greenCorridorAccess = false;

  if (isPerishable || (commodity && (commodity.toLowerCase().includes('fruit') || commodity.toLowerCase().includes('vegetable') || commodity.toLowerCase().includes('milk') || commodity.toLowerCase().includes('pharma') || commodity.toLowerCase().includes('mango') || commodity.toLowerCase().includes('apple')))) {
    tier = "Tier 1: AgriFresh IoT Cold-Chain";
    priorityLevel = "CRITICAL HIGH PRIORITY";
    greenCorridorAccess = true;
    telemetry = {
      containerId: `REEFER-IOT-${Math.floor(1000 + Math.random() * 9000)}`,
      targetTempC: 4.0,
      currentTempC: 4.2,
      minTempThresholdC: 2.0,
      maxTempThresholdC: 6.0,
      humidityPercent: 88,
      targetHumidityPercent: 85,
      ethylenePpm: 0.1,
      gasSafetyLimitPpm: 1.0,
      vibrationG: 0.1,
      doorStatus: "LOCKED_SEALED",
      powerSource: "Solar Hybrid Reefer",
      coolingSystemState: "OPTIMAL_ACTIVE",
      spoilageRiskScore: 0.8,
      freshnessIndexPercent: 99.0,
      estimatedFreshnessHoursRemaining: 240,
      nitrogenPurgeActive: true,
      lastTelemetryUpdate: "Just now"
    };
  } else if (transportMode === 'MICRO_TRANSIT' || transportMode === 'RAPIDO_UBER') {
    tier = "Tier 4: Hyperlocal Micro-Transit";
    priorityLevel = "EXPRESS LAST MILE";
  }

  const newShipment = {
    id,
    trackingNumber,
    tier,
    priorityLevel,
    commodity,
    quantity: quantity || "5.0 Metric Tons",
    origin,
    originCoords: { lat: 19.07, lng: 72.87 }, // Default fallback coordinates
    destination,
    destinationCoords: { lat: 28.61, lng: 77.20 },
    corridorId: isPerishable ? "CORR-01" : "CORR-05",
    status: "DISPATCHED",
    currentLocationName: `Origin Yard (${origin})`,
    currentCoords: { lat: 19.10, lng: 72.90 },
    progressPercent: 2.0,
    etaHours: 18.0,
    dispatchTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    expectedDelivery: "In 18 Hours",
    transporterName: "Bharat Unified Logistics Network",
    vehicleNumber: `IN-${Math.floor(10 + Math.random()*89)}-EQ-${Math.floor(1000 + Math.random()*9000)}`,
    driver: {
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      rating: 4.9,
      experienceYears: 7
    },
    telemetry,
    greenCorridorAccess,
    tollBypassPassActive: greenCorridorAccess
  };

  shipments.unshift(newShipment);
  notifySseClients({ type: 'NEW_SHIPMENT', shipment: newShipment });
  res.status(201).json({ success: true, data: newShipment });
});

// POST /api/shipments/:id/booster-cooling - Activate Instant IoT Thermal Recovery
app.post('/api/shipments/:id/booster-cooling', (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id);
  if (!shipment || !shipment.telemetry) {
    return res.status(404).json({ success: false, message: 'Shipment or IoT sensor unit not found' });
  }

  shipment.telemetry.coolingSystemState = 'BOOSTER_COOLING_ACTIVE';
  shipment.telemetry.nitrogenPurgeActive = true;
  
  notifySseClients({ type: 'TELEMETRY_UPDATE', shipments });
  res.json({ success: true, message: 'Sub-Zero Nitrogen Booster Cooling Activated!', telemetry: shipment.telemetry });
});

// GET /api/corridors - Freight Corridors
app.get('/api/corridors', (req, res) => {
  res.json({ success: true, data: INDIAN_LOGISTICS_CORRIDORS });
});

// GET /api/micro-vehicles - Get available Uber/Rapido/Porter drivers
app.get('/api/micro-vehicles', (req, res) => {
  const { city } = req.query;
  let result = microDrivers;
  if (city) {
    result = result.filter(d => d.city.toLowerCase() === city.toLowerCase());
  }
  res.json({ success: true, data: result });
});

// POST /api/micro-dispatch - Book Instant Micro-Transit Vehicle
app.post('/api/micro-dispatch', (req, res) => {
  const { driverId, pickupAddress, dropoffAddress, packageWeightKg, itemDescription } = req.body;
  const driver = microDrivers.find(d => d.id === driverId) || microDrivers[0];

  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  const dispatchId = `DISPATCH-RAPIDO-${Math.floor(100 + Math.random() * 900)}`;

  const newMicroShipment = {
    id: dispatchId,
    trackingNumber: `IN-RAPIDO-${Math.floor(1000 + Math.random() * 9000)}`,
    tier: "Tier 4: Hyperlocal Micro-Transit",
    priorityLevel: "INSTANT DISPATCH (RAPIDO/UBER FREIGHT)",
    commodity: itemDescription || "Hyperlocal Fresh Delivery",
    quantity: `${packageWeightKg || 10} Kg`,
    origin: pickupAddress || `${driver.city} Hub`,
    originCoords: driver.coords,
    destination: dropoffAddress || `${driver.city} Delivery Zone`,
    destinationCoords: { lat: driver.coords.lat + 0.04, lng: driver.coords.lng + 0.04 },
    corridorId: null,
    status: "DISPATCHED",
    currentLocationName: `${driver.name} En Route to Pickup`,
    currentCoords: driver.coords,
    progressPercent: 10,
    etaHours: 0.3, // 18 mins
    dispatchTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    expectedDelivery: "Within 20 minutes",
    transporterName: `On-Demand ${driver.vehicleType}`,
    vehicleNumber: driver.vehicleNumber,
    driver: {
      name: driver.name,
      phone: driver.phone,
      rating: driver.rating,
      experienceYears: 5
    },
    telemetry: driver.hasInsulatedColdBox ? {
      containerId: `MICRO-COLD-${Math.floor(10 + Math.random()*90)}`,
      targetTempC: 4.0,
      currentTempC: 4.3,
      minTempThresholdC: 2.0,
      maxTempThresholdC: 8.0,
      humidityPercent: 78,
      spoilageRiskScore: 0.2,
      freshnessIndexPercent: 99.8,
      lastTelemetryUpdate: "Just now"
    } : null,
    otpVerificationCode: otpCode,
    greenCorridorAccess: false
  };

  shipments.unshift(newMicroShipment);
  notifySseClients({ type: 'NEW_SHIPMENT', shipment: newMicroShipment });

  res.status(201).json({
    success: true,
    message: `Driver ${driver.name} dispatched successfully! OTP for delivery is ${otpCode}`,
    data: newMicroShipment,
    driver
  });
});

// GET /api/analytics - System performance metrics
app.get('/api/analytics', (req, res) => {
  const activeCount = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'DISPATCHED').length;
  const tier1Count = shipments.filter(s => s.tier.includes('Tier 1')).length;
  
  res.json({
    success: true,
    data: {
      totalActiveShipments: activeCount,
      tier1AgriFreshActive: tier1Count,
      foodSpoilagePreventedTons: 1428.5,
      foodWasteReductionPercent: 99.4,
      avgColdChainTempVarianceC: 0.3,
      greenCorridorBypassAvgSavedMins: 48,
      microTransitDispatches24h: 3840,
      carbonOffsetCo2Tons: 612.4,
      nationalSupplyChainHealthScore: 98.7
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BharatLogistics & AgriFresh IoT Server running on http://localhost:${PORT}`);
});
