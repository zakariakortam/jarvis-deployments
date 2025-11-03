# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Login
**POST** `/auth/login`

Request:
```json
{
  "username": "operator",
  "password": "operator123"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "username": "operator",
    "name": "John Operator",
    "email": "operator@plant.com",
    "role": "operator"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Verify Token
**GET** `/auth/verify`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "user": {
    "id": 1,
    "username": "operator",
    "name": "John Operator",
    "email": "operator@plant.com",
    "role": "operator"
  }
}
```

## Heat Management

### Get All Heats
**GET** `/heats?limit=100&offset=0`

Response:
```json
[
  {
    "id": 1,
    "heatNumber": "BOF-000001",
    "timestamp": "2025-01-02T10:00:00Z",
    "temperature": 1650.5,
    "carbonContent": 0.08,
    "oxygenLevel": 99.5,
    "slagBasicity": 3.2,
    "phosphorus": 0.015,
    "sulfur": 0.010,
    "manganese": 0.80,
    "blowTime": 18.0,
    "oxygenFlow": 450,
    "slagWeight": 5000,
    "operatorId": 1,
    "status": "completed"
  }
]
```

### Get Heat by ID
**GET** `/heats/:id`

Response:
```json
{
  "id": 1,
  "heatNumber": "BOF-000001",
  "timestamp": "2025-01-02T10:00:00Z",
  "temperature": 1650.5,
  "carbonContent": 0.08,
  "oxygenLevel": 99.5,
  "status": "completed"
}
```

### Create Heat
**POST** `/heats`

Request:
```json
{
  "heatNumber": "BOF-000002",
  "temperature": 1655.0,
  "carbonContent": 0.09,
  "oxygenLevel": 99.4,
  "slagBasicity": 3.3,
  "phosphorus": 0.016,
  "sulfur": 0.011,
  "manganese": 0.82,
  "blowTime": 19.0,
  "oxygenFlow": 455,
  "slagWeight": 5100
}
```

Response:
```json
{
  "id": 2,
  "heatNumber": "BOF-000002",
  "timestamp": "2025-01-02T10:30:00Z",
  "temperature": 1655.0,
  "status": "completed"
}
```

### Update Heat
**PUT** `/heats/:id`

Request:
```json
{
  "status": "completed",
  "notes": "Process completed successfully"
}
```

### Delete Heat
**DELETE** `/heats/:id`

Response: `204 No Content`

## SPC Statistics

### Get Statistics for Parameter
**GET** `/spc/statistics/:parameter`

Parameters: `temperature`, `carbonContent`, `oxygenLevel`, `slagBasicity`, etc.

Response:
```json
{
  "parameter": "temperature",
  "mean": 1652.3,
  "stdDev": 12.5,
  "min": 1610.0,
  "max": 1695.0,
  "count": 100
}
```

## Reports

### Generate Report
**POST** `/reports/generate`

Request:
```json
{
  "reportType": "daily",
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-02"
  },
  "format": "pdf"
}
```

Response:
```json
{
  "message": "Report generated successfully",
  "reportType": "daily",
  "downloadUrl": "/api/reports/download/report-123.pdf"
}
```

## Integration

### OPC UA Connect
**POST** `/integration/opcua/connect`

Request:
```json
{
  "endpoint": "opc.tcp://localhost:4840"
}
```

### SCADA Connect
**POST** `/integration/scada/connect`

Request:
```json
{
  "host": "localhost",
  "port": 502
}
```

## WebSocket Events

### Real-Time Monitoring

Connect to: `ws://localhost:5000`

**Client Events:**
- `subscribe_monitoring` - Subscribe to real-time data updates
- `unsubscribe_monitoring` - Unsubscribe from updates

**Server Events:**
- `real_time_data` - Receive real-time process data
  ```json
  {
    "temperature": 1652.5,
    "carbonContent": 0.08,
    "oxygenLevel": 99.5,
    "oxygenFlow": 450,
    "blowTime": 18.0,
    "timestamp": "2025-01-02T10:00:00Z"
  }
  ```

- `new_heat` - Notification of new heat created
- `alert` - Process alert notification

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message describing the issue"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests

## Data Validation

All input data is validated according to BOF process limits:

| Parameter | Min | Max | Unit |
|-----------|-----|-----|------|
| Temperature | 1500 | 1800 | °C |
| Carbon Content | 0.02 | 0.25 | % |
| Oxygen Level | 0 | 100 | % |
| Slag Basicity | 2.0 | 4.5 | CaO/SiO₂ |
| Phosphorus | 0.001 | 0.050 | % |
| Sulfur | 0.001 | 0.040 | % |

Invalid data will return `400 Bad Request` with validation errors.
