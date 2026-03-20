import Notification from '../models/Notification.js';

export const createNotification = async (userId, title, message, type = 'SYSTEM', data = {}) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            data
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};
