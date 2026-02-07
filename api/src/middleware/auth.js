const Session = require('../models/Session');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Check if session exists in DB
            const session = await Session.findOne({ token });

            if (!session) {
                return res.status(401).json({ message: 'Not authorized, invalid token' });
            }

            // Update last active
            session.lastActive = Date.now();
            await session.save();

            req.session = session;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
