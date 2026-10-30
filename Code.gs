function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Konferensiya Boshqaruv Paneli')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Qatnashchini saqlash va GitHub API orqali participants.json faylini yangilash
function addParticipant(formData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Qatnashchilar");
    
    if (!sheet) {
      sheet = ss.insertSheet("Qatnashchilar");
      sheet.appendRow(["Vaqt", "F.I.Sh.", "O'quv kursi / Guruh", "Ma'ruza mavzusi", "Yo'nalishi", "E-pochta", "Telefon raqami"]);
    }
    
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
    
    // Sheets'dagi barcha ma'lumotlarni yig'ib GitHub API'ga yuborish
    var allParticipants = getParticipants();
    syncToGitHub(allParticipants);
    
    return { success: true, message: "Ma'lumotlar bazaga va GitHub API orqali repositoriyga qo'shildi!" };
  } catch (error) {
    return { success: false, message: "Xatolik: " + error.message };
  }
}

function sanitizeInput(str) {
  if (!str) return "";
  return String(str).replace(/`/g, "'").replace(/‘/g, "'").replace(/’/g, "'").trim();
}

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

// GitHub API yordamida participants.json faylini yaratish yoki yangilash
function syncToGitHub(participantsData) {
  try {
    var token = "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";
    var owner = "xalilullohdamanov";
    var repo = "conference-registration-system";
    var path = "participants.json";
    
    var url = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path;
    
    // 1. Avval fayl mavjudligini va uning SHA kodini tekshiramiz
    var sha = "";
    try {
      var getRes = UrlFetchApp.fetch(url, {
        method: "get",
        headers: { 
          "Authorization": "token " + token, 
          "User-Agent": "AppsScript",
          "Accept": "application/vnd.github.v3+json"
        },
        muteHttpExceptions: true
      });
      if (getRes.getResponseCode() === 200) {
        var fileData = JSON.parse(getRes.getContentText());
        sha = fileData.sha;
      }
    } catch(e) {}
    
    // 2. Ma'lumotlarni JSON va Base64 formatiga o'tkazamiz
    var jsonString = JSON.stringify(participantsData, null, 2);
    var base64Content = Utilities.base64Encode(jsonString, Utilities.Charset.UTF_8);
    
    var payload = {
      message: "Automated sync participants database from Google Sheets",
      content: base64Content,
      branch: "main" // Agar GitHub'da master bo'lsa "master" ga o'zgartirasiz
    };
    
    if (sha) {
      payload.sha = sha; // Agar fayl oldindan bo'lsa SHA shart
    }
    
    // 3. GitHub API'ga PUT so'rov yuborish
    UrlFetchApp.fetch(url, {
      method: "put",
      headers: { 
        "Authorization": "token " + token,
        "Content-Type": "application/json",
        "User-Agent": "AppsScript",
        "Accept": "application/vnd.github.v3+json"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch(e) {
    Logger.log("GitHub API Error: " + e.message);
  }
}

function testGitHubSync() {
  var token = "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";
  var owner = "xalilullohdamanov";
  var repo = "conference-registration-system";
  var path = "participants.json";
  
  var url = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path;
  
  var testData = [
    { fullname: "Test Foydalanuvchi", group: "101-21", topic: "Test mavzu", direction: "AI", email: "test@mail.com", phone: "+998901234567", time: "2026-10-30" }
  ];
  
  var jsonString = JSON.stringify(testData, null, 2);
  var base64Content = Utilities.base64Encode(jsonString, Utilities.Charset.UTF_8);
  
  var payload = {
    message: "Create participants.json automatically",
    content: base64Content,
    branch: "main"
  };
  
  var response = UrlFetchApp.fetch(url, {
    method: "put",
    headers: { 
      "Authorization": "token " + token,
      "Content-Type": "application/json",
      "User-Agent": "AppsScript",
      "Accept": "application/vnd.github.v3+json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  
  Logger.log("Response Code: " + response.getResponseCode());
  Logger.log("Response Text: " + response.getContentText());
}
