function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Konferensiya Boshqaruv Paneli')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDirections() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Yo'nalishlar");
    if (!sheet) return ["Dasturiy injiniring", "Axborot xavfsizligi", "Sun'iy intellekt"];
    
    var data = sheet.getDataRange().getValues();
    var directions = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() !== "") {
        directions.push(data[i][0].toString().trim());
      }
    }
    return directions.length > 0 ? directions : ["Dasturiy injiniring", "Axborot xavfsizligi", "Sun'iy intellekt"];
  } catch (error) {
    return ["Dasturiy injiniring", "Axborot xavfsizligi", "Sun'iy intellekt"];
  }
}

function addParticipant(formData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Qatnashchilar");
    var timestamp = new Date();
    
    sheet.appendRow([
      timestamp, 
      sanitizeInput(formData.fullname), 
      sanitizeInput(formData.group), 
      sanitizeInput(formData.topic), 
      sanitizeInput(formData.direction), 
      sanitizeInput(formData.email), 
      sanitizeInput(formData.phone)
    ]);
    return { success: true, message: "Qatnashchi muvaffaqiyatli saqlandi!" };
  } catch (error) {
    return { success: false, message: "Xatolik: " + error.message };
  }
}

function sanitizeInput(str) {
  if (!str) return "";
  return String(str).replace(/`/g, "'").replace(/‘/g, "'").replace(/’/g, "'").trim();
}
