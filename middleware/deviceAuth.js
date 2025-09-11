export function verifyDeviceKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.DEVICE_API_KEY) {
    return res.status(403).json({ error: "Unauthorized device" });
  }
  next();
}
