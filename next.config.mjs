/** @type {import('next').NextConfig} */
const nextConfig = {
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
		// Allow images from the local /public/images folder
		unoptimized: false,
	},
};

export default nextConfig;
