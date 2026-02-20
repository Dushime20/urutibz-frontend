# Firewall Configuration for Frontend

## Open Port 8080

```bash
# Allow port 8080 for frontend
ufw allow 8080/tcp

# Check firewall status
ufw status

# If firewall is inactive, enable it
ufw enable
```

## Verify Port is Open

```bash
# Check if nginx is listening on port 8080
netstat -tulpn | grep :8080

# Or using ss
ss -tulpn | grep :8080
```

Expected output:
```
tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      12345/nginx
```

## Test Access

```bash
# Test locally
curl -I http://localhost:8080

# Test from outside (replace with your IP)
curl -I http://38.242.224.199:8080
```

## Common Firewall Commands

```bash
# Check firewall status
ufw status verbose

# Allow specific port
ufw allow 8080/tcp

# Delete rule
ufw delete allow 8080/tcp

# Reload firewall
ufw reload

# Disable firewall (not recommended)
ufw disable
```

## Troubleshooting

### Port not accessible from outside

```bash
# Check if nginx is running
systemctl status nginx

# Check if port is listening
netstat -tulpn | grep :8080

# Check firewall rules
ufw status numbered

# Check if cloud provider firewall is blocking
# (Check your VPS control panel)
```

### Port already in use

```bash
# Find what's using port 8080
lsof -i :8080

# Or
netstat -tulpn | grep :8080

# Kill the process if needed
kill -9 <PID>
```
