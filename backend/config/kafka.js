import { Kafka } from 'kafkajs';

// Define the client
const kafka = new Kafka({
    clientId: 'pix-tix-app',
    brokers: ['localhost:9092'], // Matches the port in docker-compose
});

// Create Producer and Consumer instances
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'email-service-group-v2' });

// Export them so other files can use them
export { kafka, producer, consumer };