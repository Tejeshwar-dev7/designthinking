# ESP32-CAM Attendance Integration

This project now uses an **ESP32-CAM attendance station** for live marking instead of the laptop webcam scanner.

## Attendance Endpoint

`POST /api/esp32/attendance`

### Required JSON payload

```json
{
  "sessionId": "session-2026-04-03",
  "profileId": "student-profile-uuid",
  "confidenceScore": 0.91,
  "classId": "class-123-demo"
}
```

### Alternate payload

If your ESP32-CAM only knows the enrolled label/name, you can post:

```json
{
  "sessionId": "session-2026-04-03",
  "recognizedName": "Asha",
  "confidenceScore": 0.91
}
```

The backend tries to resolve the student profile from either `profileId` or `recognizedName`.

## Response statuses

- `marked`: attendance inserted successfully
- `already_marked`: same student was already marked for the same session
- `unknown_profile`: the posted face label did not match any stored profile

## Device security

If you set `ESP32_DEVICE_SECRET` in your environment, the device must send:

```http
X-Device-Key: your-secret-value
```

## Optional stream preview

If your ESP32-CAM exposes an MJPEG stream, set:

```bash
NEXT_PUBLIC_ESP32_STREAM_URL=http://<esp32-ip>:81/stream
```

Then the dashboard station page will embed the live camera preview.

## Suggested ESP32-CAM workflow

1. ESP32-CAM detects/recognizes a student face.
2. Device sends `sessionId`, `profileId` or `recognizedName`, and optional `confidenceScore`.
3. Next.js API inserts attendance only once per session.
4. Dashboard polls the session feed and updates recent marks live.
