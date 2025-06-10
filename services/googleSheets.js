const { google } = require('googleapis');
const credentials = require('../config/google-credentials.json');

// Configure Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

class GoogleSheetsService {
  static async appendUserData(data) {
    try {
      const values = [
        [
          data.name,
          data.email,
          data.phone,
          data.location,
          data.orderDetails,
          new Date().toISOString(),
          data.feedback || 'N/A'
        ]
      ];

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:G', // Adjust range based on your sheet
        valueInputOption: 'USER_ENTERED',
        resource: {
          values
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error appending to Google Sheet:', error);
      throw error;
    }
  }
}

module.exports = GoogleSheetsService; 