module.exports = {
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "8080",
                pathname: "/api/anhsp/images/**"
            },
            {
                protocol: "https",
                hostname: "api.vietqr.io",
                pathname: "/image/**"
            },
            {
                protocol: "https",
                hostname: "img.vietqr.io",
                pathname: "/image/**"
            }
        ]
    }
}