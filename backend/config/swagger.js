const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Forex AI Assistant API',
            version: '1.0.0',
            description: 'API documentation for the Forex AI Assistant backend',
            contact: {
                name: 'Developer',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./routes/*.js', './server.js'], // files containing annotations
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};
