// src/config/globalConfig.js
require('dotenv').config();

const locale = process.env.APP_LOCALE || 'es-PE';
const timeZone = process.env.APP_TIMEZONE || 'America/Lima';
const currency = process.env.APP_CURRENCY || 'PEN';

const config = {
    locale,
    timeZone,
    currency,
    
    // Función para formatear moneda profesionalmente
    formatCurrency: (amount) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    },

    // Función para formatear fechas largas (Ej: Domingo, 4 de Enero...)
    formatDateLong: (date) => {
        return new Intl.DateTimeFormat(locale, {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: timeZone
        }).format(new Date(date));
    },

    // Función para fechas cortas (DD/MM/YYYY)
    formatDateShort: (date) => {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: timeZone
        }).format(new Date(date));
    }
};

module.exports = config;