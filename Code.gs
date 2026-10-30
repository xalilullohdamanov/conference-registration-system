function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Konferensiya Boshqaruv Paneli')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Qatnashchini Google Sheets'ga qo'shish funksiyasi
function addParticipant(formData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Qatnashchilar");
    
    // Agar "Qatnashchilar" varag'i bo'lmasa, avtomatik yaratib beradi
    if (!sheet) {
      sheet = ss.insertSheet("Qatnashchilar");
      sheet.appendRow(["Vaqt", "F.I.Sh.", "O'quv kursi / Guruh", "Ma'ruza mavzusi", "Yo'nalishi", "E-pochta", "Telefon raqami"]);
    }
    
    var timestamp = new Date();
    
    // Ma'lumotlarni qator ko'rinishida jadval oxiriga qo'shish
    sheet.appendRow([
      timestamp, 
      sanitizeInput(formData.fullname), 
      sanitizeInput(formData.group), 
      sanitizeInput(formData.topic), 
      sanitizeInput(formData.direction), 
      sanitizeInput(formData.email), 
      sanitizeInput(formData.phone)
    ]);
    
    return { success: true, message: "Ma'lumotlar Google Sheets'ga muvaffaqiyatli saqlandi!" };
  } catch (error) {
    return { success: false, message: "Sheets'ga yozishda xatolik: " + error.message };
  }
}

// Jadvaldagi barmoq/apostrof va tuturuq belgilarini to'g'rilash
function sanitizeInput(str) {
  if (!str) return "";
  return String(str)
    .replace(/`/g, "'")
    .replace(/‘/g, "'")
    .replace(/’/g, "'")
    .trim();
}

// Google Sheets'dan qatnashchilar ro'yxatini veb-sahifaga o'qib berish
function getParticipants() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Qatnashchilar");
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var participants = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[1]) {
        participants.push({
          time: row[0] ? new Date(row[0]).toLocaleString() : "",
          fullname: row[1],
          group: row[2],
          topic: row[3],
          direction: row[4],
          email: row[5],
          phone: row[6]
        });
      }
    }
    return participants.reverse();
  } catch (error) {
    return [];
  }
}
