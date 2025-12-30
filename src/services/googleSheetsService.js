const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwcnEOUjYTZTxCIYkc9m-CitSXn55v_XIUveaU0T3FnJy5EE-w0xbEjdou_UreaUy1o/exec';
   
export const exportToGoogleSheets = async (reports) => {
  try {
    if (!reports || reports.length === 0) {
      throw new Error('No reports to export');
    }

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reports }),
      mode: 'no-cors'
    });

    return {
      success: true,
      message: 'Spreadsheet created! Check your Google Drive.',
      sheetUrl: null
    };
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    throw new Error('Failed to export to Google Sheets');
  }
};

export const exportToGoogleSheetsWithRedirect = (reports) => {
  if (!reports || reports.length === 0) {
    throw new Error('No reports to export');
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = APPS_SCRIPT_URL;
  form.target = '_blank';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'data';
  input.value = JSON.stringify({ reports });

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  return { success: true };
};
const googleSheetsService = {
  exportToGoogleSheets,
  exportToGoogleSheetsWithRedirect
};

export default googleSheetsService;

