/** @type {import('next').NextConfig} */
const nextConfig = {
	// Suppress build-time errors from routes that require runtime env vars
	typescript: { ignoreBuildErrors: false },
	eslint: { ignoreDuringBuilds: true },
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '',
				pathname: '/images/**',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
				port: '',
				pathname: '/images/**',
			},
		],
		unoptimized: false,
	},
};

export default nextConfig;
