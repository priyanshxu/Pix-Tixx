import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

let channel = null;
let connection = null;

const QUEUE_NAME = "ticket_notifications";

export const connectRabbitMQ = async () => {
    try {
        const amqpServer = "amqps://uxofahpc:wJ99SPakEOmzZk0PqH-sBA2hR-BCOI4B@campbell.lmq.cloudamqp.com/uxofahpc";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();

        // Create the queue if it doesn't exist
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log("✅ Connected to RabbitMQ");
        return channel;
    } catch (error) {
        console.error("❌ RabbitMQ Connection Failed:", error);
    }
};

export const getChannel = () => channel;
export const getQueueName = () => QUEUE_NAME;