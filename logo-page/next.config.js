module.exports = {
    images: {
        domains: ["res.cloudinary.com"], // vẫn giữ cái này
        remotePatterns: [
            {
                protocol: "http", // thêm http cho cloudinary
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "8080",
                pathname: "/api/anhsp/images/**",
            },
            {
                protocol: "https",
                hostname: "api.vietqr.io",
                pathname: "/image/**",
            },
            {
                protocol: "https",
                hostname: "img.vietqr.io",
                pathname: "/image/**",
            },
        ],
    },
};
