const { faker } = require('@faker-js/faker');
const { logEvent } = require('./logger');

// Helper to generate random IP
const randomIp = () => faker.internet.ipv4();

// 1. Failed Login Burst
const failedLoginBurst = () => {
    const targetIp = randomIp();
    const sourceIp = randomIp(); // Attacker IP
    const username = faker.internet.username();

    console.log(`[Scenario] Starting Failed Login Burst from ${sourceIp}`);

    let count = 0;
    const interval = setInterval(() => {
        logEvent({
            source_ip: sourceIp,
            destination_ip: targetIp,
            event_type: 'AUTH_FAILURE',
            severity: 'medium',
            details: {
                username: username,
                reason: 'Invalid Password',
                attempt: count + 1
            }
        });

        count++;
        if (count >= 10) clearInterval(interval);
    }, 100); // Rapid fire every 100ms
};

// 2. SQL Injection
const sqlInjection = () => {
    const payloads = [
        "' OR 1=1 --",
        "UNION SELECT username, password FROM users",
        "DROP TABLE orders;",
        "admin' --",
        "1; SELECT * FROM information_schema.tables"
    ];
    const payload = payloads[Math.floor(Math.random() * payloads.length)];

    logEvent({
        source_ip: randomIp(),
        destination_ip: randomIp(),
        event_type: 'SQL_INJECTION',
        severity: 'high',
        details: {
            payload: payload,
            url: `/api/products?id=${encodeURIComponent(payload)}`,
            method: 'GET'
        }
    });
};

// 3. XSS Attack
const xssAttack = () => {
    const payloads = [
        "<script>alert('x')</script>",
        "<img src=x onerror=alert(1)>",
        "<svg/onload=alert(1)>",
        "javascript:alert(1)"
    ];
    const payload = payloads[Math.floor(Math.random() * payloads.length)];

    logEvent({
        source_ip: randomIp(),
        destination_ip: randomIp(),
        event_type: 'XSS_ATTEMPT',
        severity: 'medium',
        details: {
            payload: payload,
            url: `/search?q=${encodeURIComponent(payload)}`,
            user_agent: faker.internet.userAgent()
        }
    });
};

// 4. Port Scan
const portScan = () => {
    const sourceIp = randomIp();
    const targetIp = randomIp();
    const ports = [21, 22, 23, 80, 443, 3306, 8080];

    console.log(`[Scenario] Starting Port Scan from ${sourceIp}`);

    ports.forEach((port, index) => {
        setTimeout(() => {
            logEvent({
                source_ip: sourceIp,
                destination_ip: targetIp,
                event_type: 'PORT_SCAN',
                severity: 'low',
                details: {
                    port: port,
                    protocol: 'TCP',
                    status: 'CLOSED'
                }
            });
        }, index * 50);
    });
};

// 5. Token Tampering
const tokenTampering = () => {
    const events = ['invalid_jwt_signature', 'expired_token_usage', 'algorithm_none'];
    const event = events[Math.floor(Math.random() * events.length)];

    logEvent({
        source_ip: randomIp(),
        destination_ip: randomIp(),
        event_type: 'AUTH_ANOMALY',
        severity: 'high',
        details: {
            issue: event,
            token_sample: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
    });
};

// 6. Malware Beaconing
const malwareBeaconing = () => {
    const internalIp = `192.168.1.${faker.number.int({ min: 2, max: 254 })}`;
    const c2Ip = randomIp(); // External C2

    logEvent({
        source_ip: internalIp,
        destination_ip: c2Ip,
        event_type: 'MALWARE_C2',
        severity: 'critical',
        details: {
            action: 'CONNECT',
            bytes_sent: faker.number.int({ min: 100, max: 5000 }),
            destination_domain: 'suspicious-update.com'
        }
    });
};

// 7. DDoS Pattern
const ddosPattern = () => {
    const targetIp = randomIp();
    const sourceIp = randomIp(); // Single source flooding

    console.log(`[Scenario] Starting DDoS Burst from ${sourceIp}`);

    let count = 0;
    const interval = setInterval(() => {
        logEvent({
            source_ip: sourceIp,
            destination_ip: targetIp,
            event_type: 'DDOS_FLOOD',
            severity: 'critical',
            details: {
                packet_size: 1024,
                protocol: 'UDP'
            }
        });

        count++;
        if (count >= 50) clearInterval(interval); // 50 packets
    }, 20); // Very fast
};

module.exports = {
    failedLoginBurst,
    sqlInjection,
    xssAttack,
    portScan,
    tokenTampering,
    malwareBeaconing,
    ddosPattern
};
