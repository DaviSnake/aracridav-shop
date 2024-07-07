/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        styledComponents: true
    },
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'res.cloudinary.com',
        }]
    }
}

module.exports = nextConfig
