const requests = new Map();

const rateLimit = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const window = 15 * 60 * 1000;

    if (!requests.has(ip)) {
        requests.set(ip, []);
    }

    const userRequests = requests.get(ip).filter(time => now - time < window);
    
    if (userRequests.length > 100) {
        return res.status(429).json({ success: false, error: "Too many requests" });
    }

    userRequests.push(now);
    requests.set(ip, userRequests);
    next();
};

module.exports = rateLimit;
