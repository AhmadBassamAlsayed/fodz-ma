const generateFriendPaymentDeepLink = (fcode) => {
    const scheme = process.env.APP_SCHEME || 'supermarket';
    return `${scheme}://friend-payment/${fcode}`;
};

const handleFriendPaymentDeepLink = async (req, res) => {
    try {
        const { fcode } = req.params;

        if (!fcode) {
            return res.status(400).json({ message: 'FCODE is required' });
        }

        const deepLink = generateFriendPaymentDeepLink(fcode);
        const webUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/orders/friend-payment/${fcode}`;
        
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
        
        if (isMobile) {
            const appStoreUrl = process.env.APP_STORE_URL || 'https://apps.apple.com/app/supermarket';
            const playStoreUrl = process.env.PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.supermarket';
            const isIOS = /iphone|ipad|ipod/i.test(userAgent);
            
            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opening Friend Payment...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 400px;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h1 {
            font-size: 24px;
            margin: 0 0 10px;
        }
        p {
            font-size: 16px;
            opacity: 0.9;
            margin: 0 0 30px;
        }
        .button {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 12px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            margin: 5px;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: scale(1.05);
        }
        .button-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
    </style>
    <script>
        // Attempt to open the app
        window.location.href = '${deepLink}';
        
        // Fallback: redirect to store after delay if app doesn't open
        setTimeout(function() {
            window.location.href = '${isIOS ? appStoreUrl : playStoreUrl}';
        }, 2500);
        
        // Alternative: open web version
        function openWeb() {
            window.location.href = '${webUrl}';
        }
    </script>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>Opening Friend Payment</h1>
        <p>Redirecting you to the app...</p>
        <p style="font-size: 14px; opacity: 0.7;">If the app doesn't open automatically:</p>
        <a href="${deepLink}" class="button">Open App</a>
        <a href="${isIOS ? appStoreUrl : playStoreUrl}" class="button button-secondary">Download App</a>
        <br><br>
        <a href="${webUrl}" class="button button-secondary" onclick="openWeb(); return false;">Continue in Browser</a>
    </div>
</body>
</html>
            `;
            
            return res.send(html);
        }
        
        // Desktop: redirect to web version
        return res.redirect(webUrl);
        
    } catch (error) {
        console.error('Deep link error:', error);
        res.status(500).json({ 
            message: 'Failed to process deep link',
            error: error.message 
        });
    }
};

module.exports = {
    handleFriendPaymentDeepLink,
    generateFriendPaymentDeepLink
};
